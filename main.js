// ==========================
// GeoFS Independent Flare Addon
// 他アドオン干渉対策版
// Iキー版
// ==========================

(() => {

    "use strict";

    console.log("Independent Flare Addon Loaded");

    // =====================================
    // 完全独立ID
    // =====================================

    const ADDON_ID =
        "__independentFlareAddon__";

    // 前回の自分だけ削除
    if (window[ADDON_ID]?.cleanup) {

        try {

            window[ADDON_ID].cleanup();

        } catch (e) {

            console.log(e);

        }
    }

    // =====================================
    // 独立状態
    // =====================================

    const state = {

        firing: false,

        fireLoop: null,

        entities: [],

        keyHeld: false
    };

    // =====================================
    // flare画像
    // =====================================

    const FLARE_IMAGE =
        "https://oc135.github.io/test6/flare1.png.png";

    // 音
    const SOUND_URL =
        "https://oc135.github.io/test/gunsound1.mp3";

    // =====================================
    // flare設定
    // =====================================

    // flareサイズ
    const WORLD_SIZE = 2.5;

    // flare表示時間
    const FLARE_LIFETIME = 1500;

    // flare発射間隔
    const FIRE_INTERVAL = 200;

    // =====================================
    // オフセット
    // =====================================

    const OFFSET_X = 0;
    const OFFSET_Y = 0;
    const OFFSET_Z = 0;

    // =====================================
    // 音
    // =====================================

    const flareSound = new Audio();

    flareSound.src = SOUND_URL;

    flareSound.loop = true;

    flareSound.volume = 1.0;

    flareSound.preload = "auto";

    // =====================================
    // flare生成
    // =====================================

    function createFlare() {

        try {

            if (
                !window.geofs ||
                !geofs.aircraft ||
                !geofs.aircraft.instance ||
                !geofs.api ||
                !geofs.api.viewer
            ) {

                return;
            }

            const aircraft =
                geofs.aircraft.instance;

            const pos =
                aircraft.llaLocation;

            const htr =
                aircraft.htr;

            if (!pos || !htr) {
                return;
            }

            const heading =
                Cesium.Math.toRadians(htr[0]);

            // 前後

            const forwardLat =
                Math.cos(heading) *
                OFFSET_Y *
                0.00001;

            const forwardLon =
                Math.sin(heading) *
                OFFSET_Y *
                0.00001;

            // 左右

            const sideLat =
                Math.cos(
                    heading + Math.PI / 2
                ) *
                OFFSET_X *
                0.00001;

            const sideLon =
                Math.sin(
                    heading + Math.PI / 2
                ) *
                OFFSET_X *
                0.00001;

            const lat =
                pos[0] +
                forwardLat +
                sideLat;

            const lon =
                pos[1] +
                forwardLon +
                sideLon;

            const alt =
                pos[2] + OFFSET_Z;

            // flare生成

            const entity =
                geofs.api.viewer.entities.add({

                    position:
                        Cesium.Cartesian3.fromDegrees(
                            lon,
                            lat,
                            alt
                        ),

                    billboard: {

                        image:
                            FLARE_IMAGE,

                        sizeInMeters: true,

                        width:
                            WORLD_SIZE,

                        height:
                            WORLD_SIZE,

                        scale: 1,

                        scaleByDistance:
                            undefined,

                        translucencyByDistance:
                            undefined,

                        pixelOffsetScaleByDistance:
                            undefined,

                        disableDepthTestDistance: 0,

                        color:
                            Cesium.Color.WHITE.withAlpha(1),

                        verticalOrigin:
                            Cesium.VerticalOrigin.CENTER
                    }
                });

            state.entities.push(entity);

            // 自動削除

            setTimeout(() => {

                try {

                    geofs.api.viewer.entities.remove(
                        entity
                    );

                } catch (e) {}

            }, FLARE_LIFETIME);

        } catch (e) {

            console.log(
                "flare create error",
                e
            );
        }
    }

    // =====================================
    // 発射開始
    // =====================================

    function startFire() {

        if (state.firing) {
            return;
        }

        state.firing = true;

        try {

            flareSound.currentTime = 0;

            flareSound.play().catch(() => {});

        } catch (e) {}

        state.fireLoop =
            window.setInterval(() => {

                try {

                    requestAnimationFrame(() => {

                        createFlare();

                    });

                } catch (e) {}

            }, FIRE_INTERVAL);
    }

    // =====================================
    // 発射停止
    // =====================================

    function stopFire() {

        state.firing = false;

        if (state.fireLoop) {

            clearInterval(
                state.fireLoop
            );

            state.fireLoop = null;
        }

        try {

            flareSound.pause();

            flareSound.currentTime = 0;

        } catch (e) {}
    }

    // =====================================
    // Iキー
    // =====================================

    function onKeyDown(e) {

        try {

            if (
                e.repeat
            ) {
                return;
            }

            if (
                e.key === "i" ||
                e.key === "I"
            ) {

                state.keyHeld = true;

                startFire();
            }

        } catch (e) {}
    }

    function onKeyUp(e) {

        try {

            if (
                e.key === "i" ||
                e.key === "I"
            ) {

                state.keyHeld = false;

                stopFire();
            }

        } catch (e) {}
    }

    // =====================================
    // 最優先イベント
    // =====================================

    window.addEventListener(
        "keydown",
        onKeyDown,
        true
    );

    window.addEventListener(
        "keyup",
        onKeyUp,
        true
    );

    // =====================================
    // フォーカス復帰対策
    // =====================================

    window.addEventListener(
        "blur",
        () => {

            stopFire();

        },
        true
    );

    // =====================================
    // cleanup
    // =====================================

    function cleanup() {

        stopFire();

        window.removeEventListener(
            "keydown",
            onKeyDown,
            true
        );

        window.removeEventListener(
            "keyup",
            onKeyUp,
            true
        );

        state.entities.forEach(entity => {

            try {

                geofs.api.viewer.entities.remove(
                    entity
                );

            } catch (e) {}

        });

        state.entities = [];
    }

    // =====================================
    // 完全独立保存
    // =====================================

    window[ADDON_ID] = {

        cleanup
    };

})();
