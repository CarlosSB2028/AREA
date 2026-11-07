FROM node:20

RUN apt-get update && apt-get install -y curl unzip openjdk-17-jdk && rm -rf /var/lib/apt/lists/*

ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p ${ANDROID_HOME} && \
    curl -o android-sdk.zip https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip android-sdk.zip -d ${ANDROID_HOME} && \
    rm android-sdk.zip && \
    mv ${ANDROID_HOME}/cmdline-tools ${ANDROID_HOME}/latest && \
    mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/latest ${ANDROID_HOME}/cmdline-tools/ && \
    yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses && \
    ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

ENV PATH="${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/ndk/25.1.8937393:${PATH}"
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk/25.1.8937393

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN npx expo prebuild --platform android --clean

RUN sed -i '/defaultConfig {/a\        ndk {\n            abiFilters "x86_64"\n        }' android/app/build.gradle

RUN echo "android.useDeprecatedNdk=true" >> android/gradle.properties

RUN mkdir -p /root/.gradle/init.d && \
    cp gradle-init-repos.gradle /root/.gradle/init.d/gradle-init-repos.gradle || true

RUN cd android && ./gradlew assembleRelease --no-daemon

RUN mkdir -p /output

CMD cp android/app/build/outputs/apk/release/app-release.apk /output/client.apk && echo 'APK copied to /output/client.apk'