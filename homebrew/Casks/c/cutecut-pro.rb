cask "cutecut-pro" do
  version "2.4.1"
  sha256 "fdeb93eb7997885240f266040e0c1f62174c3d82a176378c7724aeb0a62452b4"

  url "https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v#{version}/CuteCut.Pro-#{version}-arm64.dmg"
  name "CuteCut Pro"
  desc "Professional multitrack video editor with Quranic audio-to-text synchronization"
  homepage "https://github.com/MDIsmatullah/CuteCut-Pro"

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
