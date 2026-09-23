cask "cutecut-pro" do
  version "2.4.5"
  sha256 :2bbb0151e2301d897c27021f1c261d763db537f82bcc2599f9e4a45e799758aa

  url "https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v#{version}/CuteCut.Pro-#{version}-arm64.dmg"
  name "CuteCut Pro"
  desc "Professional multitrack video editor with Quranic audio-to-text synchronization"
  homepage "https://github.com/MDIsmatullah/CuteCut-Pro"

depends_on arch: :arm64
  
  livecheck do
    url :url
    strategy :github_latest
  end

  app "CuteCut Pro.app"

  zap trash: [
    "~/Library/Application Support/CuteCut Pro",
    "~/Library/Preferences/org.guldasta.cutecutpro.plist",
    "~/Library/Saved Application State/org.guldasta.cutecutpro.savedState",
  ]
end
