document.addEventListener('DOMContentLoaded', () => {
    class Cpu {
        constructor(mem, ueys) {
            this.acc = '0000000000000000';
            this.ir = '0000000000000000';
            this.pc = '000000000000';
            this.uno = '1';
            this.y = '0000000000000000';
            this.z = '0000000000000000';
            this.alu = '0000000000000000';
            this.finDelPrograma = false;

            this.unidadDeMemoria = mem;
            this.unidadDeEntradaSalida = ueys;
        }

        incrementarPc() {
            this.z = completarCeros(this.pc, 16);
            this.y = completarCeros(this.uno, 16);
            let rdo = (parseInt(this.z, 2) + parseInt(this.y, 2)).toString(2);
            this.pc = completarCeros(rdo, 12);
            this.alu = completarCeros(rdo, 16);
            // Falta actualizar pc en pantalla
        }

        leerDirIr() { return this.ir.substring(4); }

        leerCodOp() { return this.ir.substring(0, 4); }

        eliminarRegistros() {
            this.acc = '0000000000000000';
            this.ir = '0000000000000000';
            this.pc = '000000000000';
            this.y = '0000000000000000';
            this.z = '0000000000000000';
            this.alu = '0000000000000000';
        }

        // Instrucciones
        halt() { document.querySelector("#aviso").value = "fin del programa"; }

        add() {
            this.z = this.acc;
            this.y = this.unidadDeMemoria.leerMemoria(this.leerDirIr());

            // El resultado puede estar entre -32768 y 32767

            // Caso 1: ACC (+) y dato de memoria (+)
            if (this.z.charAt(0) == '0' && this.y.charAt(0) == '0') {
                let rdoDecimal = parseInt(this.z, 2) + parseInt(this.y, 2);
                if (rdoDecimal > 32767) {
                    this.finDelPrograma = true;
                    document.querySelector("#aviso").value = "Overflow positivo";
                } else {
                    this.alu = completarCeros(rdoDecimal.toString(2), 16);
                    this.acc = this.alu;
                }
            }

            // Caso 2: ACC (+) y dato de memoria (-)
            else if (this.z.charAt(0) == '0' && this.y.charAt(0) == '1') {
                // Y es negativo, lo paso a positivo con el complemento a 2 y se lo resto a Z
                let rdoDecimal = parseInt(this.z, 2) - parseInt(c2(this.y), 2);
                if (rdoDecimal >= 0) {
                    this.alu = completarCeros(rdoDecimal.toString(2), 16);
                    this.acc = this.alu;
                } else {
                    this.alu = c2((-rdoDecimal).toString(2));
                    this.acc = this.alu;
                }
            }

            // Caso 3: ACC (-) y dato de memoria (+)
            else if (this.z.charAt(0) == '1' && this.y.charAt(0) == '0') {
                // Z es negativo, lo paso a positivo con el complemento a 2 (lo coloco en negativo) y le sumo Z
                let rdoDecimal = - parseInt(c2(this.z), 2) + parseInt(this.y, 2);
                if (rdoDecimal >= 0) {
                    this.alu = completarCeros(rdoDecimal.toString(2), 16);
                    this.acc = this.alu;
                } else {
                    this.alu = c2((-rdoDecimal).toString(2));
                    this.acc = this.alu;
                }
            }

            // Caso 4: ACC (-) y dato de memoria (-)
            else if (this.z.charAt(0) == '1' && this.y.charAt(0) == '1') {
                let rdoDecimal = - parseInt(c2(this.z), 2) - parseInt(c2(this.y), 2);
                if (rdoDecimal < -32768) {
                    this.finDelPrograma = true;
                    document.querySelector("#aviso").value = "Overflow negativo";
                } else {
                    this.alu = c2((-rdoDecimal).toString(2));
                    this.acc = this.alu;
                }
            }
        }

        xor() {
            this.z = this.acc;
            this.y = this.unidadDeMemoria.leerMemoria(this.leerDirIr());
            let n = '';
            for (let i = 0; i < 16; i++) { this.z.charAt(i) == this.y.charAt(i) ? n += '0' : n += '1'; }
            this.alu = n;
            this.acc = this.alu;
        }

        and() {
            this.z = this.acc;
            this.y = this.unidadDeMemoria.leerMemoria(this.leerDirIr());
            let n = '';
            for (let i = 0; i < 16; i++) { this.z.charAt(i) == '1' && this.y.charAt(i) == '1' ? n += '1' : n += '0'; }
            this.alu = n;
            this.acc = this.alu;
        }

        ior() {
            this.z = this.acc;
            this.y = this.unidadDeMemoria.leerMemoria(this.leerDirIr());
            let n = '';
            for (let i = 0; i < 16; i++) { this.z.charAt(i) == '1' || this.y.charAt(i) == '1' ? n += '1' : n += '0'; }
            this.alu = n;
            this.acc = this.alu;
        }

        not() {
            this.z = this.acc;
            let n = '';
            for (let i = 0; i < 16; i++) { this.z.charAt(i) == '0' ? n += '1' : n += '0'; }
            this.alu = n;
            this.acc = this.alu;
        }

        lda() { this.acc = this.unidadDeMemoria.leerMemoria(this.leerDirIr()); }

        sta() {
            this.unidadDeMemoria.escribirMemoria(this.leerDirIr(), this.acc);
            let tbody = document.querySelector("#tbodyMemoria");
            let aOctal = completarCeros(parseInt(this.acc, 2).toString(8), 6);
            tbody.rows[parseInt(this.acc, 2)].cells[1].innerHTML = `${this.acc}`;
            tbody.rows[parseInt(this.acc, 2)].cells[2].innerHTML = `${completarCeros(parseInt(this.acc, 2).toString(8), 6)}`;
            tbody.rows[parseInt(this.acc, 2)].cells[3].innerHTML = `${verMnemonico(this.acc.substring(0, 4))} ${aOctal.substring(2)}`;
        }

        srj() {
            this.acc = completarCeros(this.pc, 16);
            this.pc = this.leerDirIr();
        }

        jma() { if (this.acc.charAt(0) == '1') { this.pc = this.leerDirIr(); } }

        jmp() { this.pc = this.leerDirIr(); }

        // Por ahora, input y output no tienen implementación
        inp() { }
        out() { }

        ral() {
            this.z = this.acc;
            let n = '';
            for (let i = 1; i < 16; i++) { n += this.z.charAt(i); }
            this.alu = n + this.z.charAt(0);
            this.acc = this.alu;
        }

        csa() { this.acc = this.unidadDeEntradaSalida.sr; }

        // La instruccion NOP no hace nada por definición
        nop() { console.log('NOP'); }
    }


    class Um {
        constructor() {
            this.mar = '000000000000';
            this.mbr = '0000000000000000';
            this.memoria = new Array(4096);
            for (let i = 0; i < 4096; i++) { this.memoria[i] = '0000000000000000'; }
        }

        // Métodos para leer y escribir en la memoria
        leerMemoria(dir) {
            this.mar = completarCeros(dir, 12);
            this.mbr = this.memoria[parseInt(this.mar, 2)];
            return this.mbr;
        }

        escribirMemoria(dir, n) {
            this.mar = completarCeros(dir, 12);
            this.mbr = completarCeros(n, 16);
            this.memoria[parseInt(this.mar, 2)] = this.mbr;
        }

        reset() {
            this.mar = '000000000000';
            this.mbr = '0000000000000000';
            for (let i = 0; i < 4096; i++) { this.memoria[i] = '0000000000000000'; }
        }
    }


    class Ues {
        constructor() { this._sr = '0000000000000000'; }

        get sr() { return this._sr; }

        set sr(newSr) { this._sr = newSr; }
    }



    // Funciones útiles

    // Completa con ceros a la izquierda hasta que el número(n) tenga cierta cantidad de bits (bits)
    function completarCeros(n, bits) {
        while (n.length < bits) { n = '0' + n; }
        return n;
    }

    // Complemento a 2
    function c2(n) {
        n = completarCeros(n, 16);
        let rdo = '';
        for (let i = 0; i < n.length; i++) { n.charAt(i) == '0' ? rdo += '1' : rdo += '0'; }
        rdo = (parseInt(rdo, 2) + 1).toString(2);
        return completarCeros(rdo, 16);
    };

    function bits_mas_bajos_12(n16) {
        let dir = '';
        for (let i = 4; i < 16; i++) { dir = dir + n16.charAt(i); }
        return dir;
    };

    // Comprobar si número está en base 2
    function comprobarBaseDos(numero) {
        for (let i = 0; i < numero.length; i++) {
            if (numero.charAt(i) != '0' && numero.charAt(i) != '1') {
                return false;
            } else if (i == numero.length - 1) {
                return true;
            }
        }
    }

    // Comprobar si un número está en base 8
    function comprobarBaseOctal(numero) {
        for (let i = 0; i < numero.length; i++) {
            if (numero.charAt(i) != '0' && numero.charAt(i) != '1' && numero.charAt(i) != '2' && numero.charAt(i) != '3' && numero.charAt(i) != '4' && numero.charAt(i) != '5' && numero.charAt(i) != '6' && numero.charAt(i) != '7') {
                return false;
            } else if (i == numero.length - 1) {
                return true;
            }
        }
    }

    // Descrifrar mnemónico
    function verMnemonico(numeroDeCuatroBits) {
        switch (numeroDeCuatroBits) {
            case '0000': return 'HLT';
            case '0001': return 'ADD';
            case '0010': return 'XOR';
            case '0011': return 'AND';
            case '0100': return 'IOR';
            case '0101': return 'NOT';
            case '0110': return 'LDA';
            case '0111': return 'STA';
            case '1000': return 'SRJ';
            case '1001': return 'JMA';
            case '1010': return 'JMP';
            case '1011': return 'INP';
            case '1100': return 'OUT';
            case '1101': return 'RAL';
            case '1110': return 'CSA';
            case '1111': return 'NOP';
            default: return 'no';
        }
    }


    /* Creo los objetos por única vez */

    let um = new Um();
    let ues = new Ues();
    let cpu = new Cpu(um, ues);


    /* MODIFICACIONES DEL DOM */

    // Variable para ver cuál entrada del SR está activa
    let tipoEntrada = "bin";    //bin, oct, mne

    // Memoria principal
    for (let i = 0; i < um.memoria.length; i++) {
        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${completarCeros(i.toString(8), 4)}</td>
            <td>${um.memoria[i]}</td>
            <td>${completarCeros(parseInt(um.memoria[i], 2).toString(8), 6)}</td>
            <td>${verMnemonico(um.memoria[i].substring(0, 4))} ${completarCeros(parseInt(um.memoria[i], 2).toString(8), 6).substring(2)}</td>`;

        document.querySelector("#tbodyMemoria").append(tr);
    }

    // Inicializo el estilo con css personalizado de la fila 0, donde está ubicado el PC
    document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";


    /* FUNCIONALIDAD DE LOS BOTONES */

    // Botón start
    // Botón stop
    // Botón examine


    // Botón reset
    document.querySelector("#botonReset").onclick = () => {
        // Agregar cartel de confirmación para eliminar la memoria y registros

        document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
        um.reset();
        cpu.eliminarRegistros();

        document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";

        for (let i = 0; i < um.memoria.length; i++) {
            document.querySelector("#tbodyMemoria").rows[i].cells[1].innerHTML = '0000000000000000';
            document.querySelector("#tbodyMemoria").rows[i].cells[2].innerHTML = '000000';
            document.querySelector("#tbodyMemoria").rows[i].cells[3].innerHTML = 'HLT 0000';
        };

        document.querySelector("#aviso").value = "Reset";
    }

    // Botón load pc
    document.querySelector("#botonLoadPc").onclick = () => {
        ues.sr = completarCeros(document.querySelector("#SR").value, 16);
        if (comprobarBaseDos(ues.sr)) {
            document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
            cpu.pc = bits_mas_bajos_12(ues.sr);
            cpu.ir = um.leerMemoria(cpu.pc);
            document.querySelector("#aviso").value = "SR(12) --> PC";

            document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";
        } else {
            document.querySelector("#aviso").value = "Ingrese un número en base 2!";
            document.querySelector("#SR").value = "";
        }
    }

    // Botón deposite
    document.querySelector("#botonDeposite").onclick = () => {

        if (tipoEntrada == "bin") {
            let aux = completarCeros(document.querySelector("#SR").value, 16);
            if (comprobarBaseDos(aux)) {
                ues.sr = completarCeros(document.querySelector("#SR").value, 16);
                let aOctal = completarCeros((parseInt(ues.sr, 2)).toString(8), 6);
                let tbodyMemoria = document.querySelector('#tbodyMemoria').rows[parseInt(cpu.pc, 2)];
                tbodyMemoria.cells[1].innerHTML = `${ues.sr}`;
                tbodyMemoria.cells[2].innerHTML = `${aOctal}`;
                tbodyMemoria.cells[3].innerHTML = `${verMnemonico((ues.sr).substring(0, 4))} ${aOctal.substring(2)}`;

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
                um.escribirMemoria(cpu.pc, ues.sr);
                document.querySelector("#aviso").value = "SR --> memoria[PC]";
                cpu.incrementarPc();

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";
            } else {
                document.querySelector("#aviso").value = "Ingrese un número en base 2!";
                document.querySelector("#SR").value = "";
            }
        } else if (tipoEntrada == "oct") {
            let aux = document.querySelector("#SR").value;
            if (comprobarBaseOctal(aux) && (aux.charAt(0) == '0' || aux.charAt(0) == '1')) {
                let aBinario = parseInt(aux, 8).toString(2);
                ues.sr = completarCeros(aBinario, 16);

                let tbodyMemoria = document.querySelector('#tbodyMemoria').rows[parseInt(cpu.pc, 2)];
                tbodyMemoria.cells[1].innerHTML = `${ues.sr}`;
                tbodyMemoria.cells[2].innerHTML = `${completarCeros(aux, 6)}`;
                tbodyMemoria.cells[3].innerHTML = `${verMnemonico((ues.sr).substring(0, 4))} ${aux.substring(2)}`;

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
                um.escribirMemoria(cpu.pc, ues.sr);
                document.querySelector("#aviso").value = "SR --> memoria[PC]";
                cpu.incrementarPc();

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";
            } else {
                if (aux.charAt(0) != '0' && aux.charAt(0) != '1') {
                    document.querySelector("#aviso").value = "Primer número debe ser 0 o 1";
                    document.querySelector("#SR").value = "";
                } else {
                    document.querySelector("#aviso").value = "Ingrese un número en base 8!";
                    document.querySelector("#SR").value = "";
                }
            }
        } else if (tipoEntrada == "mne") {
            let aux = document.querySelector("#mneSelect").value;
            let aux1 = completarCeros(document.querySelector("#SRMnemonico").value, 4);
            if (aux != "" && comprobarBaseOctal(aux1)) {
                let aBinario = completarCeros(parseInt(aux1, 8).toString(2), 12);
                ues.sr = aux + aBinario;
                let aux3 = completarCeros(parseInt(aux, 2).toString(8), 2) + aux1;

                let tbodyMemoria = document.querySelector('#tbodyMemoria').rows[parseInt(cpu.pc, 2)];
                tbodyMemoria.cells[1].innerHTML = `${ues.sr}`;
                tbodyMemoria.cells[2].innerHTML = `${aux3}`;
                tbodyMemoria.cells[3].innerHTML = `${verMnemonico((ues.sr).substring(0, 4))} ${aux1}`;

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
                um.escribirMemoria(cpu.pc, ues.sr);
                document.querySelector("#aviso").value = "SR --> memoria[PC]";
                cpu.incrementarPc();

                document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";
            } else {
                if (aux == "") {
                    document.querySelector("#aviso").value = "Seleccione una instrucción!";
                } else {
                    document.querySelector("#aviso").value = "Ingrese un número en base 8!";
                }
            }
        }
    }

    // Botón ejecutar paso a paso
    document.querySelector("#pasoAPaso").onclick = () => {
        cpu.ir = um.leerMemoria(cpu.pc);

        document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "";
        cpu.incrementarPc();

        document.querySelector("#tbodyMemoria").rows[parseInt(cpu.pc, 2)].className = "valorDelPc";

        switch (cpu.leerCodOp()) {
            case '0000': cpu.halt(); break;
            case '0001': cpu.add(); break;
            case '0010': cpu.xor(); break;
            case '0011': cpu.and(); break;
            case '0100': cpu.ior(); break;
            case '0101': cpu.not(); break;
            case '0110': cpu.lda(); break;
            case '0111': cpu.sta(); break;
            case '1000': cpu.srj(); break;
            case '1001': cpu.jma(); break;
            case '1010': cpu.jmp(); break;
            case '1011': cpu.inp(); console.log('INP'); break;
            case '1100': cpu.out(); console.log('OUT'); break;
            case '1101': cpu.ral(); break;
            case '1110': cpu.csa(); break;
            case '1111': cpu.nop(); break;
            default:
                console.log('Campo de operación no reconocido') // borrar una vez probado
                break;
        }
    }

    // Botón para ver todos los registros de la máquina
    document.querySelector("#verRegistros").onclick = () => {
        let tbody = document.querySelector("#tbodyTablaRegistros");
        tbody.rows[0].cells[1].innerHTML = `${cpu.acc}`;
        tbody.rows[0].cells[2].innerHTML = `${completarCeros(parseInt(cpu.acc, 2).toString(8), 6)}`;

        tbody.rows[1].cells[1].innerHTML = `${cpu.ir}`;
        tbody.rows[1].cells[2].innerHTML = `${completarCeros(parseInt(cpu.ir, 2).toString(8), 6)}`;

        tbody.rows[2].cells[1].innerHTML = `${cpu.pc}`;
        tbody.rows[2].cells[2].innerHTML = `${completarCeros(parseInt(cpu.pc, 2).toString(8), 6)}`;

        tbody.rows[3].cells[1].innerHTML = `${cpu.y}`;
        tbody.rows[3].cells[2].innerHTML = `${completarCeros(parseInt(cpu.y, 2).toString(8), 6)}`;

        tbody.rows[4].cells[1].innerHTML = `${cpu.z}`;
        tbody.rows[4].cells[2].innerHTML = `${completarCeros(parseInt(cpu.z, 2).toString(8), 6)}`;

        tbody.rows[5].cells[1].innerHTML = `${cpu.alu}`;
        tbody.rows[5].cells[2].innerHTML = `${completarCeros(parseInt(cpu.alu, 2).toString(8), 6)}`;

        tbody.rows[6].cells[1].innerHTML = `${um.mar}`;
        tbody.rows[6].cells[2].innerHTML = `${completarCeros(parseInt(um.mar, 2).toString(8), 6)}`;

        tbody.rows[7].cells[1].innerHTML = `${um.mbr}`;
        tbody.rows[7].cells[2].innerHTML = `${completarCeros(parseInt(um.mbr, 2).toString(8), 6)}`;

        let srBinario = completarCeros(document.querySelector("#SR").value, 16);
        tbody.rows[8].cells[1].innerHTML = `${srBinario}`;
        tbody.rows[8].cells[2].innerHTML = `${completarCeros(parseInt(srBinario, 2).toString(8), 6)}`;


        document.querySelector("#divVerRegistros").className = "";
    }

    // Botón cerrar registros
    document.querySelector("#cerrarRegistros").onclick = () => {
        document.querySelector("#divVerRegistros").className = "d-none"
    }

    // Botón para limpiar el SR
    document.querySelector("#limpiarSR").onclick = () => {
        document.querySelector("#SR").value = "";
        document.querySelector("#SRMnemonico").value = "";
    }


    // Botón Binario
    document.querySelector("#botonBinario").onclick = () => {
        tipoEntrada = "bin";
        document.querySelector("#entradaMnemonico").className = "row d-none";
        document.querySelector("#SR").className = "form-control";
        document.querySelector("#SR").setAttribute("maxlength", "16");
        document.querySelector("#SR").setAttribute("placeholder", "número en binario");
    }
    // Botón Octal
    document.querySelector("#botonOctal").onclick = () => {
        tipoEntrada = "oct";
        document.querySelector("#entradaMnemonico").className = "row d-none";
        document.querySelector("#SR").className = "form-control";
        document.querySelector("#SR").setAttribute("maxlength", "6");
        document.querySelector("#SR").setAttribute("placeholder", "número en octal");
    }
    // Botón Mnemónico
    document.querySelector("#botonMnemonico").onclick = () => {
        tipoEntrada = "mne";
        document.querySelector("#entradaMnemonico").className = "row";
        document.querySelector("#SR").className = "form-control d-none";
    }
})