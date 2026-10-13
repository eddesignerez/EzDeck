# EzDeck — companion Android

O app Android descobre o host EzDeck na rede local e carrega a PWA em tela cheia. Ele usa o protocolo `ezdeck:discover`, confirma o health check `{"ok":true,"service":"EzDeck"}` e preserva somente o endpoint já validado.

## Build de desenvolvimento

Requer JDK 17 e Android SDK:

```sh
cd android
./gradlew assembleDebug
```

O aplicativo resultante usa o identificador `com.eddesignerez.ezdeck`.

No Windows, abra esta pasta `android` no Android Studio. Para gerar um APK de
teste, execute `gradlew.bat assembleDebug` nesta pasta. O arquivo será criado
em `app/build/outputs/apk/debug/app-debug.apk`. Um simples “Build successful”
da sincronização não significa que o APK já tenha sido gerado.

## Assinatura de release

Uma release exige keystore externa. Configure estes quatro valores em `gradle.properties` fora do repositório ou como variáveis de ambiente:

```properties
EZDECK_RELEASE_STORE_FILE=/caminho/seguro/ezdeck-release.keystore
EZDECK_RELEASE_STORE_PASSWORD=...
EZDECK_RELEASE_KEY_ALIAS=ezdeck
EZDECK_RELEASE_KEY_PASSWORD=...
```

Nenhuma keystore, senha ou APK de release deve ser versionado.

## Atualização pelo GitHub

O APK consulta a última release estável ao abrir, mesmo sem conexão com o host
Windows. A consulta usa o endereço público do repositório, sem token da API,
e uma falha de internet não impede o uso na rede local.

Após escolher Atualizar e conceder a permissão de instalação, o download
autorizado é acompanhado mesmo se a Activity for recriada. Ao concluir, o
APK verifica o pacote, a versão e a assinatura antes de abrir o instalador
do Android. Se o app estiver em segundo plano, continua ao voltar para ele.
A confirmação final pertence ao sistema Android; não há instalação silenciosa.
