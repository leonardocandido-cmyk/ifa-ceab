import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {

    const container = document.getElementById("bengala-3d-container");

    if (!container) {
        console.error("Container da bengala 3D não encontrado.");
        return;
    }

    // =========================================================
    // CONFIGURAÇÕES DO MODELO
    // =========================================================

    const CONFIG = {

        comprimentoBengala: 110,
        diametroPVC: 2.5,

        // Posição do sensor
        sensorX: -55,

        // Componentes internos
        arduinoX: -20,
        bateriaX: 5,

        // Empunhadura
        caboInicio: 35,
        caboComprimento: 20,

        // Estado inicial
        explodido: false

    };


    // =========================================================
    // CENA
    // =========================================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xe9edf2);


    // =========================================================
    // CÂMERA
    // =========================================================

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    camera.position.set(
        0,
        45,
        150
    );


    // =========================================================
    // RENDERER
    // =========================================================

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);


    // =========================================================
    // CONTROLES
    // =========================================================

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.minDistance = 50;

    controls.maxDistance = 300;


    // =========================================================
    // ILUMINAÇÃO
    // =========================================================

    const ambientLight =
        new THREE.HemisphereLight(
            0xffffff,
            0x777777,
            2
        );

    scene.add(ambientLight);


    const light =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    light.position.set(
        30,
        80,
        80
    );

    light.castShadow = true;

    scene.add(light);


    // =========================================================
    // GRUPO PRINCIPAL DA BENGALA
    // =========================================================

    const bengala =
        new THREE.Group();

    scene.add(bengala);


    // =========================================================
    // MATERIAIS
    // =========================================================

    const materialPVC =
        new THREE.MeshStandardMaterial({
            color: 0xf4f4f4,
            roughness: 0.65,
            metalness: 0.05
        });


    const materialPreto =
        new THREE.MeshStandardMaterial({
            color: 0x171717,
            roughness: 0.8
        });


    const materialAzul =
        new THREE.MeshStandardMaterial({
            color: 0x174a85,
            roughness: 0.5,
            metalness: 0.2
        });


    const materialMetal =
        new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.35,
            metalness: 0.8
        });


    const materialBateria =
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.5
        });


    const materialVermelho =
        new THREE.MeshStandardMaterial({
            color: 0xcc2222
        });


    const materialPretoFio =
        new THREE.MeshStandardMaterial({
            color: 0x111111
        });


    // =========================================================
    // CANO DE PVC
    // =========================================================

    const geometriaPVC =
        new THREE.CylinderGeometry(
            CONFIG.diametroPVC / 2,
            CONFIG.diametroPVC / 2,
            CONFIG.comprimentoBengala,
            32
        );

    const pvc =
        new THREE.Mesh(
            geometriaPVC,
            materialPVC
        );

    // Cylinder originalmente no eixo Y
    pvc.rotation.z = Math.PI / 2;

    pvc.castShadow = true;
    pvc.receiveShadow = true;

    bengala.add(pvc);


    // =========================================================
    // SENSOR HC-SR04
    // =========================================================

    const sensor =
        new THREE.Group();

    sensor.position.x =
        -CONFIG.comprimentoBengala / 2 - 2;

    sensor.position.y = 0;

    sensor.position.z = 0;


    // Placa
    const placaSensor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                5,
                1
            ),
            materialAzul
        );

    placaSensor.rotation.y =
        Math.PI / 2;

    sensor.add(placaSensor);


    // Dois transdutores ultrassônicos

    function criarTransdutor(x) {

        const corpo =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1.6,
                    1.6,
                    2,
                    32
                ),
                materialMetal
            );

        corpo.rotation.z =
            Math.PI / 2;

        corpo.position.x = x;

        sensor.add(corpo);


        const frente =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1.25,
                    1.25,
                    0.2,
                    32
                ),
                materialPreto
            );

        frente.rotation.z =
            Math.PI / 2;

        frente.position.x =
            x - 1.1;

        sensor.add(frente);
    }


    criarTransdutor(-2);
    criarTransdutor(2);

    sensor.userData.originalPosition =
        sensor.position.clone();

    bengala.add(sensor);


    // =========================================================
    // SUPORTE DO SENSOR
    // =========================================================

    const suporteSensor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4,
                6,
                6
            ),
            materialPVC
        );

    suporteSensor.position.x =
        -CONFIG.comprimentoBengala / 2 + 1;

    suporteSensor.position.z = 0;

    suporteSensor.castShadow = true;

    bengala.add(suporteSensor);


    // =========================================================
    // ARDUINO NANO
    // =========================================================

    const arduino =
        new THREE.Group();

    arduino.position.x =
        CONFIG.arduinoX;

    arduino.position.z =
        0;

    const placaArduino =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                18,
                5,
                3
            ),
            materialAzul
        );

    placaArduino.castShadow = true;

    arduino.add(placaArduino);


    // Microcontrolador central

    const chip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                5,
                1.5,
                2
            ),
            materialPreto
        );

    chip.position.y = 3;

    arduino.add(chip);


    // Pinos laterais

    for (let i = 0; i < 10; i++) {

        const pino =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.5,
                    1,
                    0.5
                ),
                materialMetal
            );

        pino.position.x =
            -7 + i * 1.55;

        pino.position.y = 3;

        arduino.add(pino);
    }

    bengala.add(arduino);


    // =========================================================
    // BATERIA 9V
    // =========================================================

    const bateria =
        new THREE.Group();

    bateria.position.x =
        CONFIG.bateriaX;

    bateria.position.y =
        0;

    const corpoBateria =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                10,
                17,
                7
            ),
            materialBateria
        );

    corpoBateria.castShadow = true;

    bateria.add(corpoBateria);


    // Terminal positivo

    const terminalPositivo =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                1,
                1,
                1,
                16
            ),
            materialVermelho
        );

    terminalPositivo.position.y = 9;

    bateria.add(terminalPositivo);


    // Terminal negativo

    const terminalNegativo =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                1,
                1,
                1,
                16
            ),
            materialMetal
        );

    terminalNegativo.position.y = 9;

    terminalNegativo.position.x = 2;

    bateria.add(terminalNegativo);


    bengala.add(bateria);


    // =========================================================
    // EMPUNHADURA
    // =========================================================

    const empunhadura =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                5,
                5,
                CONFIG.caboComprimento,
                32
            ),
            materialPreto
        );

    empunhadura.rotation.z =
        Math.PI / 2;

    empunhadura.position.x =
        CONFIG.caboInicio +
        CONFIG.caboComprimento / 2;

    empunhadura.castShadow = true;

    bengala.add(empunhadura);


    // =========================================================
    // ANÉIS DA EMPUNHADURA
    // =========================================================

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const anel =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    5.1,
                    0.45,
                    12,
                    32
                ),
                materialMetal
            );

        anel.rotation.y =
            Math.PI / 2;

        anel.position.x =
            CONFIG.caboInicio +
            2 +
            i * 4;

        bengala.add(anel);
    }


    // =========================================================
    // FIOS
    // =========================================================

    function criarFio(
        inicio,
        fim,
        material
    ) {

        const pontos = [
            inicio,
            new THREE.Vector3(
                (inicio.x + fim.x) / 2,
                inicio.y - 2,
                inicio.z
            ),
            fim
        ];

        const curva =
            new THREE.CatmullRomCurve3(
                pontos
            );

        const geometria =
            new THREE.TubeGeometry(
                curva,
                20,
                0.18,
                8,
                false
            );

        const fio =
            new THREE.Mesh(
                geometria,
                material
            );

        bengala.add(fio);

        return fio;
    }


    // Fio vermelho
    criarFio(
        new THREE.Vector3(
            CONFIG.bateriaX,
            7,
            0
        ),
        new THREE.Vector3(
            CONFIG.arduinoX,
            3,
            0
        ),
        materialVermelho
    );


    // Fio preto
    criarFio(
        new THREE.Vector3(
            CONFIG.bateriaX,
            -7,
            0
        ),
        new THREE.Vector3(
            CONFIG.arduinoX,
            -3,
            0
        ),
        materialPretoFio
    );


    // Fios do sensor
    criarFio(
        new THREE.Vector3(
            -48,
            0,
            0
        ),
        new THREE.Vector3(
            CONFIG.arduinoX - 5,
            0,
            0
        ),
        materialVermelho
    );


    // =========================================================
    // PONTEIRA
    // =========================================================

    const ponteira =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.2,
                24,
                24
            ),
            materialPreto
        );

    ponteira.scale.y = 1.4;

    ponteira.position.x =
        CONFIG.comprimentoBengala / 2;

    ponteira.position.y = -2;

    ponteira.castShadow = true;

    bengala.add(ponteira);


    // =========================================================
    // SUPORTE PARA EXIBIÇÃO
    // =========================================================

    const base =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                300,
                180
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd7dce2,
                roughness: 1
            })
        );

    base.rotation.x =
        -Math.PI / 2;

    base.position.y = -12;

    base.receiveShadow = true;

    scene.add(base);


    // =========================================================
    // CENTRALIZAÇÃO
    // =========================================================

    bengala.rotation.z =
        Math.PI / 2;

    bengala.position.y = 10;


    // =========================================================
    // VISTA EXPLODIDA
    // =========================================================

    function alternarExplodido() {

        CONFIG.explodido =
            !CONFIG.explodido;


        if (CONFIG.explodido) {

            pvc.visible = false;

            sensor.position.x -= 15;

            arduino.position.y += 12;

            bateria.position.y -= 12;

            empunhadura.position.y += 5;

        } else {

            pvc.visible = true;

            sensor.position.copy(
                sensor.userData.originalPosition
            );

            arduino.position.y = 0;

            bateria.position.y = 0;

            empunhadura.position.y = 0;
        }
    }


    // =========================================================
    // INTERFACE
    // =========================================================

    const controlsDiv =
        document.createElement("div");

    controlsDiv.className =
        "bengala-3d-controls";


    const btnExplodir =
        document.createElement("button");

    btnExplodir.innerText =
        "Vista Explodida";

    btnExplodir.onclick =
        alternarExplodido;

    controlsDiv.appendChild(
        btnExplodir
    );


    const btnFrontal =
        document.createElement("button");

    btnFrontal.innerText =
        "Vista Frontal";

    btnFrontal.onclick =
        function () {

            camera.position.set(
                0,
                20,
                170
            );

            controls.target.set(
                0,
                0,
                0
            );

        };

    controlsDiv.appendChild(
        btnFrontal
    );


    const btnLateral =
        document.createElement("button");

    btnLateral.innerText =
        "Vista Lateral";

    btnLateral.onclick =
        function () {

            camera.position.set(
                170,
                20,
                0
            );

            controls.target.set(
                0,
                0,
                0
            );

        };

    controlsDiv.appendChild(
        btnLateral
    );


    container.appendChild(
        controlsDiv
    );


    // =========================================================
    // TEXTO
    // =========================================================

    const info =
        document.createElement("div");

    info.className =
        "bengala-3d-info";

    info.innerHTML =
        "<strong>Bengala Inteligente</strong><br>" +
        "PVC + HC-SR04 + Arduino Nano + 9V";

    container.appendChild(info);


    // =========================================================
    // RESPONSIVIDADE
    // =========================================================

    function ajustarTamanho() {

        const largura =
            container.clientWidth;

        const altura =
            container.clientHeight;

        camera.aspect =
            largura / altura;

        camera.updateProjectionMatrix();

        renderer.setSize(
            largura,
            altura
        );
    }


    window.addEventListener(
        "resize",
        ajustarTamanho
    );


    // =========================================================
    // LOOP 3D
    // =========================================================

    function animar() {

        requestAnimationFrame(
            animar
        );

        controls.update();

        renderer.render(
            scene,
            camera
        );
    }


    animar();

})();