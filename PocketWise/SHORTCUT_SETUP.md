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
7. Add a **Text** action. For the installed app, start with this base URL:

   `webapp://nithan.in/PocketWise/?quickadd=shortcut`

   Then append `&amount=`, `&type=`, `&category=`, and `&note=` using the blue magic variables from the variable picker. **Critical:** after `amount=`, choose the output of **Ask for Number · Enter transaction amount**. Do not use **Provided Input** from the first “Receive from Share Sheet” action; that is unrelated input and is a common reason the app opens with no amount. After `type=`, choose the `tx_type` variable. After `category=`, choose the output of the category prompt, not the transaction-type menu result. After `note=`, choose the output of the optional note prompt. URL-encode each dynamic value separately where possible; never URL-encode the entire assembled URL.
8. Add **Open URLs** and pass it the Text result from the previous action. For a Safari fallback, build a second Text action with the same parameters but replace the prefix with `https://nithan.in/PocketWise/`. The app accepts query parameters and hash parameters, but the `webapp://` custom scheme is not an Apple-documented API and behavior can vary by iOS version.
9. Run the Shortcut once with a tiny test amount (for example ₹1) and confirm that Pocketwise opens with the amount/type/category/note filled in. Save the test transaction only if you want it in your records; delete it afterward if needed.

## Assign Back Tap

1. Open iPhone **Settings → Accessibility → Touch → Back Tap → Double Tap**.
2. Select `Pocketwise Quick Add`.
3. Double-tap the back of the iPhone to run it. The Shortcut collects the fields, opens Pocketwise for review, and then you tap **Save transaction**.

## Privacy and limitations

- The Shortcut passes the captured values in a URL. Pocketwise reads query or fragment parameters and removes them from the visible URL after parsing, but iOS/browser history or Shortcuts diagnostics may briefly expose the URL. Do not put bank credentials, UPI PINs, or other secrets in the note.
- The Shortcut does not bypass the app's save action. Nothing is recorded until you explicitly tap Save.
- The category should match a category name or ID in the current Pocketwise workspace. If it doesn't, the app asks you to choose one.
- iOS may open Safari rather than the installed PWA depending on iOS version, installation method and URL scope. Test on the target phone.
- This is not native Dynamic Island UI. Native Dynamic Island interaction requires an iOS app with ActivityKit/App Intents and a supported Live Activity design.
