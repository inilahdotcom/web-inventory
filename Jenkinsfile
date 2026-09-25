// Pipeline CI/CD web-inventory: bangun image frontend (Vite + nginx) dari branch
// develop, dorong ke Harbor, lalu jalankan di VM tujuan lewat SSH. Domain
// diarahkan ke container ini oleh nginx di VM (reverse proxy -> 127.0.0.1:PORT).
//
// Tiap build mendorong dua tag:
//   <nomor build>-<commit 7 karakter>   contoh :12-9517f1a  tetap, untuk dilacak balik ke kode
//   <nama branch>                       contoh :develop     selalu menunjuk build terakhir
//
// BEDA DENGAN inventory-service: variabel VITE_* dibaca Vite saat BUILD dan
// ditanam ke bundle JS, jadi .env dipakai di tahap Bangun image (bukan
// `docker run --env-file`). Mengganti isi .env berarti harus build ulang.
// Isi .env juga ikut di dalam image, jadi image ini hanya boleh ada di Harbor
// privat.
//
// KREDENSIAL YANG HARUS SUDAH ADA DI JENKINS:
//   robothb            Username with password         robot Harbor (push untuk Jenkins, pull untuk VM)
//   vm-deploy          SSH Username with private key  kunci SSH ke VM tujuan
//   web-inventory-env  Secret file                    isi .env frontend (VITE_API_URL, VITE_API_KEY)

pipeline {
    agent any

    // Dipicu webhook GitHub push, sama seperti inventory-service. Webhook repo
    // inilahdotcom/web-inventory harus diarahkan ke https://jk.inilahtv.com/github-webhook/
    // dengan secret yang sama (github-webhook-secret).
    triggers {
        githubPush()
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // Deploy tidak boleh berjalan berbarengan - dua build sekaligus akan
        // saling menimpa container di VM tujuan.
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY = 'hb.inilahtv.com'
        IMAGE    = 'hb.inilahtv.com/inilah/web-inventory'

        VM   = '12.105.0.1'
        PORT = '5000'             // port di VM; nginx reverse proxy menembak ke sini
        BIND = '127.0.0.1'        // hanya nginx di VM yang boleh akses. Ganti 0.0.0.0 kalau nginx ada di mesin lain
        APP  = 'web-inventory'    // nama container di VM tujuan
    }

    stages {

        stage('Info') {
            steps {
                script {
                    env.SHA    = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
                    env.TAG    = "${env.BUILD_NUMBER}-${env.SHA}"
                    // Job Pipeline biasa mengisi GIT_BRANCH dengan "origin/develop".
                    env.BRANCH = sh(script: 'echo "${GIT_BRANCH#origin/}"', returnStdout: true).trim()
                }
                sh '''
                    echo "branch : $BRANCH"
                    echo "commit : $SHA - $(git log -1 --pretty=%s)"
                    echo "image  : $IMAGE:$TAG dan $IMAGE:$BRANCH"
                    echo "tujuan : $VM ($BIND:$PORT -> 5000)"
                '''
            }
        }

        stage('Bangun image') {
            steps {
                withCredentials([file(credentialsId: 'web-inventory-env', variable: 'ENV_FILE')]) {
                    // .env di repo diabaikan - yang dipakai selalu isi credential,
                    // supaya ganti URL/key API cukup lewat Jenkins tanpa commit.
                    sh '''
                        set -eu
                        install -m 600 "$ENV_FILE" .env
                        docker build -t ${IMAGE}:${TAG} -t ${IMAGE}:${BRANCH} .
                    '''
                }
            }
        }

        stage('Dorong ke Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'robothb',
                                                  usernameVariable: 'HU',
                                                  passwordVariable: 'HP')]) {
                    sh '''
                        echo "$HP" | docker login ${REGISTRY} -u "$HU" --password-stdin
                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:${BRANCH}
                    '''
                }
            }
        }

        stage('Deploy ke VM') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'vm-deploy',
                                      keyFileVariable: 'KUNCI',
                                      usernameVariable: 'SSHUSER'),
                    usernamePassword(credentialsId: 'robothb',
                                     usernameVariable: 'RU',
                                     passwordVariable: 'RP')
                ]) {
                    sh '''
                        set -eu
                        kirim() {
                            ssh -i "$KUNCI" -o StrictHostKeyChecking=accept-new \
                                -o ConnectTimeout=10 "$SSHUSER@$VM" "$@"
                        }

                        SEBELUM=$(kirim "docker inspect -f '{{.Config.Image}}' $APP 2>/dev/null || true")
                        echo "versi sebelumnya di $VM: ${SEBELUM:-(belum ada, ini deploy pertama)}"

                        # Heredoc TANPA petik: $RP dkk disisipkan di sini, jadi
                        # rahasianya mengalir lewat stdin, bukan argumen perintah.
                        kirim 'bash -s' <<EOF
set -eu
trap "docker logout '$REGISTRY' >/dev/null 2>&1 || true" EXIT

echo '$RP' | docker login '$REGISTRY' -u '$RU' --password-stdin
docker pull '$IMAGE:$TAG'

docker rm -f '$APP' >/dev/null 2>&1 || true
docker run -d --name '$APP' --restart unless-stopped \
    -p $BIND:$PORT:5000 \
    --log-opt max-size=3m --log-opt max-file=3 \
    '$IMAGE:$TAG'

# Pastikan nginx di container benar-benar melayani halaman sebelum dianggap
# berhasil (wget bawaan busybox di image nginx-unprivileged:alpine).
for i in 1 2 3 4 5; do
    if docker exec '$APP' wget -q -O /dev/null http://127.0.0.1:5000/; then
        echo "container $APP jalan di $VM ($BIND:$PORT) dari $IMAGE:$TAG"
        exit 0
    fi
    sleep 2
done
echo "container $APP tidak merespons"; docker logs --tail 50 '$APP'; exit 1
EOF
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                rm -f .env
                docker logout ${REGISTRY} >/dev/null 2>&1 || true
                docker rmi ${IMAGE}:${TAG} ${IMAGE}:${BRANCH} >/dev/null 2>&1 || true
            '''
        }
        success { script { kabari('✅ BERHASIL') } }
        aborted { script { kabari('⚠️ DIBATALKAN') } }
        failure {
            echo "Build gagal. Container lama di ${VM} TIDAK diubah kalau kegagalannya terjadi sebelum tahap Deploy."
            script { kabari('❌ GAGAL') }
        }
    }
}

// Mengirim hasil build ke Telegram, sama seperti inventory-service. Token, chat
// id, dan thread id diambil dari credential Jenkins:
//   telegram-bot-token   Secret text
//   telegram-chat-id     Secret text
//   telegram-thread-id   Secret text
def kabari(String status) {
    try {
        withCredentials([
            string(credentialsId: 'telegram-bot-token', variable: 'TG_TOKEN'),
            string(credentialsId: 'telegram-chat-id',   variable: 'TG_CHAT'),
            string(credentialsId: 'telegram-thread-id', variable: 'TG_THREAD')
        ]) {
            def pesan = """<b>${status}</b> · ${env.JOB_NAME} #${env.BUILD_NUMBER}
<b>commit</b> <code>${env.SHA ?: '-'}</code> · ${env.BRANCH ?: '-'}
<b>durasi</b> ${currentBuild.durationString.replace(' and counting', '')}
<a href="${env.BUILD_URL}console">Lihat log</a>"""

            // Skrip sh berpetik TUNGGAL: shell yang mengembangkan $TG_TOKEN, bukan
            // Groovy, supaya token tidak ikut tertulis ke skrip.
            withEnv(["PESAN=${pesan}"]) {
                sh(label: 'kirim notifikasi Telegram', script: '''
                    curl -sS -m 15 -o /dev/null \
                      "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
                      --data-urlencode "chat_id=${TG_CHAT}" \
                      --data-urlencode "message_thread_id=${TG_THREAD}" \
                      --data-urlencode "parse_mode=HTML" \
                      --data-urlencode "disable_web_page_preview=true" \
                      --data-urlencode "text=${PESAN}"
                ''')
            }
        }
    } catch (e) {
        // Gagal mengirim notifikasi tidak boleh mengubah hasil build.
        echo "Notifikasi Telegram gagal: ${e.message}"
    }
}
