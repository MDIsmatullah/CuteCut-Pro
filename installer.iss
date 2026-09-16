; =====================================================================
; Inno Setup Script (.iss) for CuteCut Video Editor
; Professional AI Quran & Multi-Track Video Production Suite
; =====================================================================

#define MyAppName "CuteCut Pro"
#define MyAppShortName "CuteCutPro"
#define MyAppVersion "2.4.1"
#define MyAppPublisher "Asmatullah Developer"
#define MyAppURL "https://github.com/MDIsmatullah/CuteCut-Pro"
#define MyAppExeName "cutecut-pro.exe"

[Setup]
; Basic Application Info
AppId={{2E0654E6-452F-4ECB-8718-6414384B1DOC}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation Target Directories
DefaultDirName={autopf}\{#MyAppShortName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=no
OutputBaseFilename=CuteCutPro_Setup_v{#MyAppVersion}
OutputDir=dist-installer
SetupIconFile=build-resources\icon.ico

; Compression & Performance Optimization
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Uninstaller Configuration & Display Icon
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "Create a Quick Launch shortcut"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Primary Desktop Executable and Support Binaries from Production Dist
Source: "dist-desktop\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Check: DirExists(ExpandConstant('{#SourcePath}\dist-desktop\win-unpacked'))
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{userappdata}\{#MyAppShortName}"
Type: filesandordirs; Name: "{localappdata}\{#MyAppShortName}"
Type: filesandordirs; Name: "{app}\cache"
Type: filesandordirs; Name: "{app}\logs"

[Code]
// Helper function to check directory existence dynamically
function DirExists(DirName: string): Boolean;
begin
  Result := DirExists(DirName);
end;

procedure CurUninstallStepChanged(JustAfterUninstall: Integer);
begin
  if JustAfterUninstall = usUninstall then
  begin
    // Clean residual user cache, settings, and temporary WebGPU/V8 cache files
    DelTree(ExpandConstant('{userappdata}\{#MyAppShortName}'), True, True, True);
    DelTree(ExpandConstant('{localappdata}\{#MyAppShortName}'), True, True, True);
  end;
end;
