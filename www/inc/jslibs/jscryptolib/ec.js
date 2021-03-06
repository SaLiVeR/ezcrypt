/* jscrypto library, ellitpic curve cryptography
 *   by GUAN Zhi <guanzhi at guanzhi dot org>
 */
 
jscrypto.ec = function(name, field, a, b, G, n, h) {
	this.name = name;
	this.field = field;
	this.a = a;
	this.b = b;
	this.generator = G;
	this.order = n;
	this.cofactor = h;
};

jscrypto.ec.point = function(x, y, z) {
	if (x == undefined || y == undefined) {
		this.is_infinity = true;
		return;
	}
	this.x = x.slice(0);
	this.y = y.slice(0);
	if (z == undefined) {
		this.z = bn_one.slice(0, x.length);
	} else {
		this.z = z.slice(0);
	}
	this.is_infinity = false;
};

jscrypto.ec.prototype.double = function(A) {
	var x1 = A.x, y1 = A.y, z1 = A.z;
	var t1, t2, t3;
	var x3, y3, z3;
	t1 = this.field.square	(z1);
	t2 = this.field.subtract(x1, t1);
	t1 = this.field.add		(x1, t1);
	t2 = this.field.multiply(t2, t1);
	t2 = this.field.add(this.field.add(t2, t2), t2);
	y3 = this.field.add		(y1, y1);
	z3 = this.field.multiply(y3, z1);
	y3 = this.field.square	(y3);
	t3 = this.field.multiply(y3, x1);
	y3 = this.field.square	(y3);
	y3 = this.field.div2	(y3);
	x3 = this.field.square	(t2);
	t1 = this.field.add		(t3, t3);
	x3 = this.field.subtract(x3, t1);
	t1 = this.field.subtract(t3, x3);
	t1 = this.field.multiply(t1, t2);
	y3 = bn_mod_nistp192_sub(t1, y3);
	return new ecpoint(x3, y3, z3);
};

jscrypto.ec.prototype.add = function(A, B) {
	if (A.is_infinity == true)
		return new ecpoint(x2, y2, bn_one.slice(0, 13));
	var x1 = A.x, y1 = A.y, z1 = A.z;
	var t1, t2, t3, t4;
	var x3, y3, z3;
	
	t1 = this.field.square	(z1);
	t2 = this.field.multiply(t1, z1);
	t1 = this.field.multiply(t1, x2);
	t2 = this.field.multiply(t2, y2);
	t1 = this.field.subtract(t1, x1);
	t2 = this.field.subtract(t2, y1);
	if (bn_is_zero(t1)) {
		return bn_is_zero(t2) ? 
			secp192r1_double(new ecpoint(x2, y2, bn_one.slice(0, 13))) : 
			new ecpoint();
	}
	z3 = this.field.multiply(z1, t1);
	t3 = this.field.square	(t1);
	t4 = this.field.multiply(t3, t1);
	t3 = this.field.multiply(t3, x1);
	t1 = this.field.add		(t3, t3);
	x3 = this.field.square	(t2);
	x3 = this.field.subtract(x3, t1);
	x3 = this.field.subtract(x3, t4);
	t3 = this.field.subtract(t3, x3);
	t3 = this.field.multiply(t3, t2);
	t4 = this.field.multiply(t4, y1);
	y3 = this.field.subtract(t3, t4);
	return new ecpoint(x3, y3, z3);
};

jscrypto.ec.prototype.toAffine = function(A) {
	var z_1 = this.field.invert(A.z);
	var z_2 = this.field.square(z_1);
	var z_3 = this.field.multiply(z_1, z_2);
	return new ecpoint(
		this.field.multiply(A.x, z_2), 
		this.field.multiply(A.y, z_3));
}

jscrypto.ec.prototype.multiply = function(k, P) {
};

jscrypto.ec.prototype.preCompute = function() {
};

jscrypto.ec.prototype.multiplyGenerator = function(k) {
	var bits = k.toBits(k);
	var i = bits.length;
	
	
	var kG = ecparam.kG;
	if (kG.length < bits) {
		ecparam_pre_compute(ecparam);
	}
	
	var R = new ecpoint(kG[i].x, kG[i].y, kG[i].z);
	while (--i >= 0) {
		if (bits[i] == '1')
			R = ecpoint_add(R, kG[i], nistp192);
	}
	return R;
}

function ecpoint_mul_G_nistp192(k) {
	var bits = bn_to_bits(k);
	var i = bits.length;
	var kG = nistp192.kG;
	var R = new ecpoint(kG[i].x, kG[i].y, kG[i].z);
	while (--i >= 0) {
		if (bits[i] == '1')
			R = ecpoint_add(R, kG[i], nistp192);
	}
	return R;
}

