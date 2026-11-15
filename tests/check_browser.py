"""Optional browser checks against the Vite production preview; no app dependency."""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('APP_URL', 'http://localhost:4173/ai-job-matcher/')
OUTPUT = Path('/tmp/ai-job-matcher-react')
OUTPUT.mkdir(exist_ok=True)


def view(page, name):
    page.get_by_role('navigation', name='Job views').get_by_role('button', name=name, exact=True).click()


def layout(page, width):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal overflow'
    for target in page.locator('button, input, select').all():
        box = target.bounding_box()
        if box:
            assert box['height'] >= 44, box
            assert box['x'] >= 0 and box['x'] + box['width'] <= width + 1, box
    if width < 640:
        assert page.locator('.dashboard').bounding_box()['height'] < 180
    assert page.locator('article').first.bounding_box()['width'] <= width


with sync_playwright() as p:
    executable = shutil.which('chromium')
    browser = p.chromium.launch(headless=True, args=['--no-sandbox'], **({'executable_path': executable} if executable else {}))
    for width in (375, 390, 1440):
        context = browser.new_context(viewport={'width': width, 'height': 1000}, device_scale_factor=1)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        expect(page.get_by_role('heading', name='AI Job Matcher', exact=True)).to_be_visible()
        expect(page.locator('article')).to_have_count(10)
        layout(page, width)
        page.get_by_label('Search title or company').fill('  LUMEN ')
        expect(page.locator('article')).to_have_count(1)
        page.screenshot(path=str(OUTPUT / f'{width}-active.png'), full_page=True)
        page.get_by_role('button', name='Save', exact=True).click()
        view(page, 'Saved')
        expect(page.locator('.badge').filter(has_text='Not Applied')).to_have_count(1)
        page.get_by_role('button', name='Mark Applied', exact=True).click()
        expect(page.get_by_role('button', name='Reject', exact=True)).to_have_count(0)
        expect(page.get_by_role('button', name='Mark Applied', exact=True)).to_have_count(0)
        expect(page.get_by_role('button', name='Undo Applied', exact=True)).to_have_count(0)
        expect(page.locator('.summary strong')).to_have_text(['10', '1', '1', '0'])
        page.get_by_label('Application status').select_option('Not Applied')
        expect(page.locator('article')).to_have_count(0)
        page.get_by_label('Application status').select_option('Applied')
        expect(page.locator('article')).to_have_count(1)
        date = page.evaluate('JSON.parse(localStorage.getItem("ai-job-matcher:statuses:v1")).statuses["demo-01"].applied_at')
        page.reload()
        view(page, 'Saved')
        expect(page.get_by_role('button', name='Unsave', exact=True)).to_have_count(1)
        expect(page.locator('.badge.applied')).to_have_count(1)
        assert date == page.evaluate('JSON.parse(localStorage.getItem("ai-job-matcher:statuses:v1")).statuses["demo-01"].applied_at')
        layout(page, width)
        page.screenshot(path=str(OUTPUT / f'{width}-saved-applied.png'), full_page=True)
        page.get_by_role('button', name='Unsave', exact=True).click()
        view(page, 'Applied')
        expect(page.get_by_role('button', name='Save', exact=True)).to_have_count(1)
        page.get_by_role('button', name='Save', exact=True).click()
        view(page, 'Active')
        page.get_by_label('Search title or company').fill('Clover')
        page.get_by_role('button', name='Save', exact=True).click()
        page.get_by_role('button', name='Reject', exact=True).click()
        for name in ('Active', 'Saved', 'Applied'):
            view(page, name)
            expect(page.locator('article')).to_have_count(0)
        view(page, 'Rejected')
        expect(page.get_by_role('button', name='Restore to Active', exact=True)).to_have_count(1)
        expect(page.get_by_role('button', name='Save', exact=True)).to_have_count(0)
        expect(page.get_by_role('button', name='Mark Applied', exact=True)).to_have_count(0)
        expect(page.locator('.summary strong')).to_have_text(['9', '1', '1', '1'])
        page.reload()
        view(page, 'Rejected')
        expect(page.locator('article')).to_have_count(1)
        layout(page, width)
        page.screenshot(path=str(OUTPUT / f'{width}-rejected.png'), full_page=True)
        page.get_by_role('button', name='Restore to Active', exact=True).click()
        view(page, 'Saved')
        expect(page.locator('article')).to_have_count(1)  # Only Lumen retained Saved.
        view(page, 'Active')
        page.get_by_label('Search title or company').fill('Clover')
        expect(page.get_by_role('button', name='Save', exact=True)).to_have_count(1)
        expect(page.get_by_role('button', name='Mark Applied', exact=True)).to_have_count(1)
        page.get_by_label('Location', exact=True).select_option('Berlin, Germany')
        expect(page.locator('article')).to_have_count(0)
        page.get_by_label('Search title or company').fill('product owner')
        page.get_by_label('Location', exact=True).select_option('Dublin, Ireland')
        page.get_by_label('Seniority', exact=True).select_option('Junior')
        expect(page.locator('article')).to_have_count(1)
        expect(page.locator('.summary strong')).to_have_text(['10', '1', '1', '0'])
        assert not errors, errors
        # Two tabs receive storage updates, rather than displaying stale labels.
        other = context.new_page()
        other.goto(URL)
        view(other, 'Applied')
        expect(other.get_by_role('button', name='Unsave', exact=True)).to_have_count(1)
        other.get_by_role('button', name='Unsave', exact=True).click()
        expect(page.locator('.summary strong')).to_have_text(['10', '0', '1', '0'])
        context.close()
        print(f'PASS {width}px: layout, tap targets, tracking, filters, reload persistence, cross-tab sync')
    # Unavailable storage remains usable and warns instead of crashing.
    context = browser.new_context()
    context.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new Error('blocked')}})")
    page = context.new_page()
    page.goto(URL)
    expect(page.get_by_role('alert')).to_be_visible()
    page.get_by_role('button', name='Save', exact=True).first.click()
    expect(page.locator('.summary strong')).to_have_text(['10', '1', '0', '0'])
    expect(page.get_by_role('alert')).to_contain_text('only kept for this visit')
    context.close()
    browser.close()
print(f'PASS blocked storage fallback. Screenshots: {OUTPUT}')
