# EzDeck release and code-signing policy

EzDeck is an open-source Windows and Android adaptation inspired by [Dokke](https://github.com/felipenalves/Dokke), by Felipe Alves. It preserves the MIT license and original attribution. EzDeck is independent and is not affiliated with or endorsed by Dokke.

## Supported release channels

- Public Windows installers are built only from the `main` branch by `.github/workflows/release.yml`.
- Android release APKs are built from the same reviewed source and signed with the EzDeck Android release key.
- A Windows installer is published only after its GitHub Actions run completes and, when configured, its SignPath signing request completes.
- Releases are published through the official `eddesignerez/EzDeck` GitHub repository.

## Maintainer controls

- Protect `main`: require pull requests, a passing test workflow, and at least one maintainer approval.
- Enable two-factor authentication for every repository maintainer.
- Keep signing credentials only in GitHub Actions secrets. They must never be committed to this repository or included in an issue, pull request, or release note.
- Review the workflow and release artifacts before publishing.

## macOS

EzDeck does not ship a macOS host. For macOS, use the original [Dokke project](https://github.com/felipenalves/Dokke).
