function setCharAt(str, index, chr) {
	if (index > str.length - 1) {
		return str;
	}
	return str.substr(0, index) + chr + str.substr(index + 1);
}
export default {
	length: 15,
	numbers: true,
	special_chars: true,
	restrict_chars: [','],
	minimumNumbers: 3,
	minimunSpecialChars: 2,
	minimunMayus: 1,
	_RDN(base) {
		return Math.ceil(base.length * Math.random() * Math.random());
	},
	_ensureSpecial(password,punctuation,specials) {
		let specialchars = punctuation.slice(0),special,position;
		while (specials < this.minimunSpecialChars) {
			special = specialchars.charAt(this._RDN(punctuation));
			position = this._RDN(password);
			if (specialchars.indexOf(password[position]) === -1) {
				punctuation = specialchars.slice(0, position) + specialchars.slice(position + 1);
				password = setCharAt(password, position, special);
				specials++;
			}
		}
	},
	_ensureNumbers(password,numeric,punctuation,numbers) {
		let number;
		let position;
		while (numbers < this.minimumNumbers) {
			number = numeric.charAt(this._RDN(numeric));
			position = this._RDN(password);
			if (punctuation.indexOf(password[position]) === -1 && numeric.indexOf(password[position]) === -1) {
				password = setCharAt(password, position, number);
				numbers++;
			}
		}
	},
	gen() {
		const string = "abcdefghijklmnopqrstuvwxyz"; //to upper
		const numeric = '0123456789';
		let punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
		this.restrict_chars.forEach(function (char) {
			let index = punctuation.indexOf(char);
			punctuation = punctuation.slice(0, index) + punctuation.slice(index + 1);
		});
		let password = "";
		let numbers = 0;
		let mayus = 0;
		let specials = 0;
		while (password.length < this.length) {
			let cmp = Math.ceil(Math.exp(Math.random() * this.length));
			let generator = string;
			if (cmp % 3 === 0 && this.numbers) {
				generator = numeric;
				numbers++;
			} else if (cmp % 5 === 0 && this.special_chars) {
				generator = punctuation;
				specials++;
			}
			let entity = Math.ceil(this._RDN(generator));
			entity = generator.charAt(entity);
			let makemayus = this._RDN(password) % 2;
			if (makemayus) {
				mayus++;
			}
			password += makemayus ? entity : entity.toUpperCase();
		}
		this._ensureSpecial(password,punctuation,specials);
		this._ensureNumbers(password, numeric,punctuation,numbers);
		return password;
	}
};
