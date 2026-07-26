const form = document.getElementById("applicationForm");
const successMessage = document.getElementById("successMessage");
const countrySelect = document.getElementById("country");
const citySelect = document.getElementById("city");
const phoneCountrySelect = document.getElementById("phoneCountry");

const countryCityMap = {
	us: [{ value: "los-angeles", label: "Los Angeles" }],
	es: [{ value: "zaragoza", label: "Zaragoza" }],
};

const phoneFormatByCountry = {
	us: { placeholder: "1234567890", digits: 10, label: "Estados Unidos" },
	es: { placeholder: "612345678", digits: 9, label: "Espana" },
};

const fieldRules = {
	companyName: {
		validator: (value) => value.trim().length >= 2,
		message: "Ingresa un nombre de empresa valido (minimo 2 caracteres).",
	},
	taxId: {
		validator: (value) => /^[A-Za-z0-9-]{6,20}$/.test(value.trim()),
		message: "La identificacion fiscal debe tener entre 6 y 20 caracteres alfanumericos.",
	},
	contactName: {
		validator: (value) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,60}$/.test(value.trim()),
		message: "Ingresa un nombre de contacto valido (solo letras, minimo 3 caracteres).",
	},
	contactEmail: {
		validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
		message: "Ingresa un email corporativo valido.",
	},
	phoneCountry: {
		validator: (value) => value === "us" || value === "es",
		message: "Selecciona un prefijo telefonico valido.",
	},
	contactPhone: {
		validator: (value) => {
			const digits = value.replace(/\D/g, "");
			if (phoneCountrySelect.value === "us") return /^\d{10}$/.test(digits);
			if (phoneCountrySelect.value === "es") return /^\d{9}$/.test(digits);
			return false;
		},
		message: "Ingresa un telefono valido para el pais seleccionado.",
	},
	country: {
		validator: (value) => value.trim() !== "",
		message: "Selecciona un pais.",
	},
	city: {
		validator: (value) => value.trim() !== "",
		message: "Selecciona una ciudad.",
	},
	productType: {
		validator: (value) => value.trim() !== "",
		message: "Selecciona un tipo de producto.",
	},
	monthlyVolume: {
		validator: (value) => {
			const number = Number(value);
			return Number.isInteger(number) && number > 0;
		},
		message: "El volumen mensual debe ser un numero entero mayor que 0.",
	},
};

function updatePhoneInputFormat() {
	const selected = phoneFormatByCountry[phoneCountrySelect.value] || phoneFormatByCountry.us;
	const phoneInput = document.getElementById("contactPhone");
	phoneInput.placeholder = selected.placeholder;
}

function updateCityOptions() {
	const countryValue = countrySelect.value;
	const cities = countryCityMap[countryValue] || [];

	citySelect.innerHTML = "";
	if (cities.length === 0) {
		citySelect.disabled = true;
		citySelect.classList.add("bg-slate-100");
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "Primero selecciona un pais";
		citySelect.appendChild(option);
		return;
	}

	citySelect.disabled = false;
	citySelect.classList.remove("bg-slate-100");
	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.textContent = "Selecciona una ciudad";
	citySelect.appendChild(defaultOption);

	cities.forEach((city) => {
		const option = document.createElement("option");
		option.value = city.value;
		option.textContent = city.label;
		citySelect.appendChild(option);
	});
}

function setError(element, errorId, message) {
	const errorNode = document.getElementById(errorId);
	if (!errorNode) return;
	errorNode.textContent = message;
	errorNode.classList.remove("hidden");
	errorNode.setAttribute("role", "alert");
	errorNode.setAttribute("aria-live", "polite");
	if (element) {
		element.setAttribute("aria-invalid", "true");
		element.classList.add("border-red-500", "ring-2", "ring-red-200");
		element.classList.remove("border-slate-300");
	}
}

function clearError(element, errorId) {
	const errorNode = document.getElementById(errorId);
	if (!errorNode) return;
	errorNode.textContent = "";
	errorNode.classList.add("hidden");
	if (element) {
		element.setAttribute("aria-invalid", "false");
		element.classList.remove("border-red-500", "ring-2", "ring-red-200");
		element.classList.add("border-slate-300");
	}
}

function validateCheckboxGroup(name, errorId, message) {
	const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
	const hasSelection = Array.from(checkboxes).some((checkbox) => checkbox.checked);

	if (!hasSelection) {
		setError(null, errorId, message);
		return false;
	}

	clearError(null, errorId);
	return true;
}

function validateField(fieldId) {
	const element = document.getElementById(fieldId);
	const rule = fieldRules[fieldId];
	if (!element || !rule) return true;

	const value = element.value;
	const isValid = rule.validator(value);
	if (!isValid) {
		let message = rule.message;
		if (fieldId === "contactPhone") {
			message =
				phoneCountrySelect.value === "us"
					? "Para Estados Unidos ingresa 10 digitos (ejemplo: 1234567890)."
					: "Para Espana ingresa 9 digitos (ejemplo: 612345678).";
		}
		setError(element, `${fieldId}Error`, message);
		return false;
	}

	clearError(element, `${fieldId}Error`);
	return true;
}

function validateAllFields() {
	let isFormValid = true;

	Object.keys(fieldRules).forEach((fieldId) => {
		if (!validateField(fieldId)) {
			isFormValid = false;
		}
	});

	const countriesValid = validateCheckboxGroup(
		"countries",
		"countriesError",
		"Selecciona al menos un pais donde operan.",
	);
	if (!countriesValid) isFormValid = false;

	const servicesValid = validateCheckboxGroup(
		"services",
		"servicesError",
		"Selecciona al menos un servicio de interes.",
	);
	if (!servicesValid) isFormValid = false;

	return isFormValid;
}

Object.keys(fieldRules).forEach((fieldId) => {
	const element = document.getElementById(fieldId);
	if (!element) return;

	element.addEventListener("input", () => {
		validateField(fieldId);
		successMessage.classList.add("hidden");
	});

	element.addEventListener("blur", () => {
		validateField(fieldId);
	});
});

countrySelect.addEventListener("change", () => {
	updateCityOptions();
	if (countrySelect.value === "us" || countrySelect.value === "es") {
		phoneCountrySelect.value = countrySelect.value;
		updatePhoneInputFormat();
	}
	validateField("country");
	validateField("city");
	validateField("phoneCountry");
	validateField("contactPhone");
	successMessage.classList.add("hidden");
});

phoneCountrySelect.addEventListener("change", () => {
	updatePhoneInputFormat();
	validateField("phoneCountry");
	validateField("contactPhone");
	successMessage.classList.add("hidden");
});

["countries", "services"].forEach((groupName) => {
	const errorId = `${groupName}Error`;
	const message =
		groupName === "countries"
			? "Selecciona al menos un pais donde operan."
			: "Selecciona al menos un servicio de interes.";

	document.querySelectorAll(`input[name="${groupName}"]`).forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			validateCheckboxGroup(groupName, errorId, message);
			successMessage.classList.add("hidden");
		});
	});
});

form.addEventListener("submit", (event) => {
	event.preventDefault();
	successMessage.classList.add("hidden");

	if (!validateAllFields()) {
		return;
	}

	successMessage.classList.remove("hidden");
	form.reset();
});

form.addEventListener("reset", () => {
	Object.keys(fieldRules).forEach((fieldId) => {
		const element = document.getElementById(fieldId);
		clearError(element, `${fieldId}Error`);
	});
	clearError(null, "countriesError");
	clearError(null, "servicesError");
	updateCityOptions();
	updatePhoneInputFormat();
	successMessage.classList.add("hidden");
});

updateCityOptions();
updatePhoneInputFormat();
