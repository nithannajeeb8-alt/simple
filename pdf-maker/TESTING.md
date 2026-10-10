# Smoke-test record

The following checks were run against the current project source:

- JavaScript syntax check (`node --check app.js`): passed.
- Local browser UI smoke test: passed with no browser-side JavaScript exceptions.
- Imported two local images and confirmed two page cards were created.
- Changed brightness and contrast, rotated a page, changed paper size/orientation, enabled page numbering, and set an output name.
- Generated and downloaded a PDF in the browser.
- PDF parser check (`pdfinfo`): passed; output contained 2 pages with US Letter landscape dimensions.
- Opened the generated PDF preview modal: passed.
- Captured a mobile-sized browser view to check responsive layout.

Not verified in this environment: installation from a real public HTTPS URL, service-worker offline behavior on a physical phone, and installation steps on actual iOS/Android devices. Those depend on deploying the static files and testing on the target devices.
