# EzDeck — companion Android

O app Android descobre o host EzDeck na rede local e carrega a PWA em tela cheia. Ele usa o protocolo `ezdeck:discover`, confirma o health check `{"ok":true,"service":"EzDeck"}` e preserva somente o endpoint já validado.

## Build de desenvolvimento

Requer JDK 17 e Android SDK:

```sh
cd android
./gradlew assembleDebug
```

O aplicativo resultante usa o identificador `com.eddesignerez.ezdeck`, portanto será instalado separadamente de qualquer versão do Dokke.

## Assinatura de release

Uma release exige keystore externa. Configure estes quatro valores em `gradle.properties` fora do repositório ou como variáveis de ambiente:

```properties
EZDECK_RELEASE_STORE_FILE=/caminho/seguro/ezdeck-release.keystore
EZDECK_RELEASE_STORE_PASSWORD=...
EZDECK_RELEASE_KEY_ALIAS=ezdeck
EZDECK_RELEASE_KEY_PASSWORD=...
```

Nenhuma keystore, senha ou APK de release deve ser versionado.
