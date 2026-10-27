# Building the mobile Screens dependency

The mobile v5 stack uses a committed tarball derived from
[this integration commit](https://github.com/juliusmarminge/react-native-screens/commit/e70c651e670231635c4acb33d3f57c4238c300f6).
The archive carries the integration changes; the app does not patch this package.
Each archive includes compiled JavaScript, declarations, native source and
`jcode-fork.json` recording its version, source commit and upstream base.

The archive records the source commit and upstream base in `jcode-fork.json`.
For an update, create a maintained fork, integrate the changes against upstream,
and publish the source commit before replacing the archive. Update the package
path and lockfile, then verify mobile types and affected navigation tests.
Native source changes also require rebuilding and testing the native client.

The same iOS binary supports iPhone, iPad, and Duo. UIKit hinge updates enable
phone workspace columns at runtime; regular phones retain portrait rotation.
Use the normal EAS build profiles and update channels. Duo support requires a
binary built with the iOS 27.1 SDK; an OTA cannot add the native APIs.
