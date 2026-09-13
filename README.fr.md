# EzDeck

Panneau local de raccourcis pour contrôler un ordinateur Windows depuis Android, une tablette ou un navigateur. EzDeck est une adaptation indépendante pour Windows et Android inspirée de [Dokke](https://github.com/felipenalves/Dokke), avec les crédits MIT d’origine conservés.

![Logo EzDeck](public/ezdeck-logo.png)

## Contenu

- Hôte Windows natif avec icône de zone de notification, PIN, port configurable, démarrage avec Windows et raccourci sur le Bureau.
- APK Android et PWA navigateur avec découverte sur le réseau local, association par PIN et mises à jour WebSocket.
- Boutons pour applications, sites et raccourcis clavier; icônes personnalisées, pages multiples, glisser-déposer et thèmes clair/sombre.
- Onze langues d’interface. Le choix fait dans EzDeck Windows est repris par Android et le navigateur.

## Installation

Téléchargez `EzDeck-Setup.exe` depuis la release officielle, lancez-le et utilisez le raccourci du bureau. Le compagnon Android/PWA se connecte par PIN, WebSocket et découverte sur le réseau local.

Consultez le [manuel](MANUAL_DE_USO.md) et la [carte mentale](MAPA_MENTAL.md). N’exposez pas le port local à Internet.

## Documentation et développement

Le [manuel](MANUAL_DE_USO.md) détaille l’installation, l’association et le dépannage; la [carte mentale](MAPA_MENTAL.md) présente l’hôte, les clients et le réseau local. Pour développer, utilisez Windows 10/11 et Node.js 20+ : `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, puis `.\windows\run-dev.ps1`.

## Utilisation complète

1. Téléchargez `EzDeck-Setup.exe` depuis les [Releases officielles](https://github.com/eddesignerez/EzDeck/releases), installez-le puis ouvrez **EzDeck** depuis le Bureau. Le runtime est inclus : Node.js n’est pas nécessaire pour l’utilisateur.
2. Si le pare-feu le demande, autorisez l’application uniquement sur les **réseaux privés**. Fermer la fenêtre envoie l’hôte dans la zone de notification ; **Éteindre EzDeck** l’arrête complètement.
3. Connectez le PC et le téléphone/tablette au même Wi‑Fi. Utilisez l’adresse après **Accès** et le PIN à quatre chiffres. L’APK cherche l’hôte automatiquement ; sinon saisissez IP et port.
4. L’adresse peut aussi être ouverte dans Chrome, Safari ou Edge puis ajoutée à l’écran d’accueil ; c’est recommandé pour iPhone/iPad.

## Créer et synchroniser le panneau

- Glissez les applications dans les emplacements vides, réorganisez les cartes et utilisez le **X** pour les retirer.
- Utilisez `+ Page` pour ajouter une page et `− Page` pour retirer la dernière page vide.
- Le bouton clavier crée des commandes comme `Ctrl+C` ; `+` ajoute `.exe`, `.lnk`, `.bat` ou `.cmd`.
- Cliquez une carte pour son icône personnalisée et appuyez sur **Enregistrer** pour envoyer les changements à Android/PWA.

Les commandes vont à la fenêtre Windows active ; les applications ouvertes comme administrateur peuvent bloquer l’automatisation.

## Réglages, sécurité et compatibilité

- **PIN** définit le code, **AUTO** en crée un et **PORT** change après redémarrage.
- Activez **Démarrer avec Windows**, utilisez soleil/lune pour le thème et choisissez la langue uniquement sur l’hôte Windows ; Android/PWA la reflète.
- Ne partagez pas le PIN et n’exposez pas le port à Internet. Après un changement de réseau, rouvrez EzDeck ou utilisez la nouvelle adresse.
- Compatible Windows 10/11, Android 5.0 ou supérieur et navigateurs modernes sur le même réseau.

Développement : Windows 10/11 et Node.js 20+, puis `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## Crédits

EzDeck est une adaptation indépendante Windows/Android inspirée de [Dokke](https://github.com/felipenalves/Dokke), par Felipe Alves, sous licence MIT. Licence et crédits d’origine sont dans [LICENSE](LICENSE). Pour macOS, téléchargez Dokke original.
