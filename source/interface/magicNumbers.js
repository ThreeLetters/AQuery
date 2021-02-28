class MagicNumbers {
    constructor() {
        this.table = {};
        this.numberPool = [252e4, 252e8, 252e12];
        this.assigned = [];
        this.currentNumber = 0;

        this.buildTable();
    }

    buildTable() {
        var used = [];
        for (var i = 1; i <= 10; i++) {
            for (var j = 1; j <= 10; j++) {
                if (j !== i || i == 1) {
                    var val = 2520 * i / j;
                    if (!used[val]) {
                        used[val] = true;

                        var num = parseInt(val.toString().slice(-4, -1));
                        this.table[num] = this.table[num - 1] = i / j;

                        var num = parseInt((100000 - val).toString().slice(-4, -1));
                        this.table[num] = this.table[num - 1] = -i / j;
                    }
                }
            }
        }
    }
    getCoefficients(num) {
        var str = num.toString();

        var first = this.table[parseInt(str.slice(-4 - 3, -1 - 3))] || 0
        var sec = this.table[parseInt(str.slice(-8 - 3, -5 - 3))] || 0
        var third = this.table[parseInt(str.slice(-12 - 3, -9 - 3))] || 0

        if (num < 0) {
            first = -first;
            sec = -sec;
            third = -third;
        }

        var recon = this.numberPool[0] * first + this.numberPool[1] * sec + this.numberPool[2] * third
        var dif = num - recon

        return { // Value = ax + by + cz + d
            offset: dif,
            first: first,
            second: sec,
            third: third
        }
    }
    getMagicNumber(obj) {
        var index = this.assigned.indexOf(obj);
        if (index !== -1) {
            return this.numberPool[index];
        }
        if (this.currentNumber >= 3) {
            this.currentNumber = 0;
        }
        this.assigned[this.currentNumber] = obj;
        return this.numberPool[this.currentNumber++];
    }
    numberToObjects(num) {
        var coefficients = this.getCoefficients(num);
        var objs = [];
        if (coefficients.first) {
            objs.push([this.assigned[0], coefficients.first]);
        }
        if (coefficients.second) {
            objs.push([this.assigned[1], coefficients.second]);
        }
        if (coefficients.third) {
            objs.push([this.assigned[2], coefficients.third]);
        }

        return {
            objects: objs,
            offset: coefficients.offset
        }
    }
}

var magicNumbers = new MagicNumbers();
