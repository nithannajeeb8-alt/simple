# Pocketwise Quick Add for iPhone Back Tap

This setup lets an iPhone Shortcut collect the amount, transaction type, category and optional note before opening Pocketwise. Pocketwise then shows a pre-filled review/save screen. The transaction is saved only when you tap **Save transaction** (or **Skip note & save**). This avoids silent or accidental financial records.

> A PWA cannot put a custom form inside Dynamic Island. Back Tap runs an Apple Shortcut; the Shortcut opens Pocketwise. For this to open as the installed app, install Pocketwise from Safari using **Share → Add to Home Screen** and test the URL on your iPhone.

## Create the Shortcut

1. Open Apple's **Shortcuts** app and tap **+** to create a shortcut. Name it `Pocketwise Quick Add`.
2. Add **Ask for Input**. Set the prompt to `Amount in rupees`, input type to **Number**, and save the result as the magic variable `Amount`.
3. Add **Choose from Menu** with these menu items: `Income`, `Purchase`, and `Refund`.
   - In the `Income` branch, add a **Text** action containing exactly `income`; set its result as variable `Type`.
   - In the `Purchase` branch, add a **Text** action containing exactly `expense`; set its result as variable `Type`.
   - In the `Refund` branch, add a **Text** action containing exactly `refund`; set its result as variable `Type`.
4. After the menu, add **Ask for Input** with input type **Text**, prompt `Category (use a Pocketwise category name)`. Save its result as `Category`. Use a category name that exists in Pocketwise, such as `Food`, `Transport`, or `Other`. If the category doesn't match, Pocketwise will show its category picker instead of guessing.
5. Add **Ask for Input** with input type **Text**, prompt `Note (optional)`. Save its result as `Note`. You can leave this blank.
6. Add **URL Encode** actions for `Category` and `Note` if that action is available in your iOS version. Keep the encoded results in separate variables, e.g. `Encoded Category` and `Encoded Note`. This prevents spaces, `&`, and punctuation from breaking the URL.
7. Add a **Text** action. Replace `YOUR_BASE_URL` with the base URL copied from Pocketwise Settings → Quick Add Shortcut. Build this URL by inserting the blue magic variables from the variable picker, not by typing their names literally:

   `YOUR_BASE_URL&amount=[Amount]&type=[Type]&category=[Encoded Category]&note=[Encoded Note]`

   The base URL already ends in `?quickadd=shortcut`. Insert each variable using Shortcuts' variable picker. If your Shortcuts version's **URL Encode** action encodes the whole URL rather than one value, use the unencoded category/note fields only for simple text without `&`, `?`, or `#` characters.
8. Add **Open URLs** and pass it the Text result from the previous action.
9. Run the Shortcut once with a tiny test amount (for example ₹1) and confirm that Pocketwise opens with the amount/type/category/note filled in. Save the test transaction only if you want it in your records; delete it afterward if needed.

## Assign Back Tap

1. Open iPhone **Settings → Accessibility → Touch → Back Tap → Double Tap**.
2. Select `Pocketwise Quick Add`.
3. Double-tap the back of the iPhone to run it. The Shortcut collects the fields, opens Pocketwise for review, and then you tap **Save transaction**.

## Privacy and limitations

- The Shortcut passes the captured values in a URL. Pocketwise immediately removes the query from the address bar after reading it, but iOS/browser history or Shortcuts diagnostics may briefly expose the URL. Do not put bank credentials, UPI PINs, or other secrets in the note.
- The Shortcut does not bypass the app's save action. Nothing is recorded until you explicitly tap Save.
- The category should match a category name or ID in the current Pocketwise workspace. If it doesn't, the app asks you to choose one.
- iOS may open Safari rather than the installed PWA depending on iOS version, installation method and URL scope. Test on the target phone.
- This is not native Dynamic Island UI. Native Dynamic Island interaction requires an iOS app with ActivityKit/App Intents and a supported Live Activity design.
