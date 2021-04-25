App.setPreference('StatusBarStyle', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');

App.appendToConfig(`
<platform name="ios">
  <config-file parent="BGTaskSchedulerPermittedIdentifiers" target="*-Info.plist">
    <array>
      <string>com.transistorsoft.fetchNotifications</string>
    </array>
  </config-file>
</platform>
`);
