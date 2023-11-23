//Slider
var quantitySlider = document.getElementById("quantitySlider");
var colorSlider = document.getElementById("colorSlider");

// Input
var quantityInput = document.getElementById("quantityInput");
var colorInput = document.getElementById("color");
var resultInput = document.getElementById("result");

// API base URL V1
const baseUrl = "https://api.swagup.com/form-api/v1";

// Text-block
var typeTextBlock = document.getElementById("type-text");
var resultTypeTextBlock = document.getElementById("result-type"); // Getting the result-type text block

// Variable to store the selected type value, with default value "Pack"
var selectedPricingType = "Pack";

// Elements with IDs
var packElement = document.getElementById("packElement");
var bulkElement = document.getElementById("bulkElement");

// Set defaults
quantityInput.innerText = 50;
colorInput.innerText = 1;
quantitySlider.value = quantityInput.innerText;
colorSlider.value = colorInput.innerText;
resultInput.innerText = "$ 00"; // Setting default value to result input
typeTextBlock.textContent = "Pack Quantity"; // Setting default text
resultTypeTextBlock.textContent = "Price per pack"; // Setting default text for result-type block

fetchSwagPrices(colorSlider.value, quantitySlider.value, selectedPricingType);
domOps();
// Function to handle radio change
function handleRadioChange() {
  var typeRadio = document.querySelector('input[name="type"]:checked');

  if (typeRadio) {
    selectedPricingType = typeRadio.value;
    typeTextBlock.textContent =
      typeRadio.value === "Pack" ? "Pack Quantity" : "Item Quantity";
    resultTypeTextBlock.textContent =
      typeRadio.value === "Pack" ? "Price per pack" : "Price per item"; // Set text for result-type block

    if (typeRadio.value === "Pack") {
      packElement.classList.add("is-active");
      bulkElement.classList.remove("is-active");
    } else {
      packElement.classList.remove("is-active");
      bulkElement.classList.add("is-active");
    }
    fetchSwagPrices(
      colorSlider.value,
      quantitySlider.value,
      selectedPricingType
    );
  }
}

function makeRequestBody(dynamicColors, dynamicQuantity, type) {
  if (type.toLowerCase() === "pack") {
    const itemIds = [144, 131, 64, 105, 296, 2652, 93, 91];
    const unitsPerPack = 1;
    const products = itemIds.map((item_id) => ({
      item_id,
      units_per_pack: unitsPerPack,
      colors: parseInt(dynamicColors)
    }));

    const packRequestBody = {
      quantities: [{ quantity: parseInt(dynamicQuantity) }],
      products
    };
    return packRequestBody;
  } else {
    const bulkRequestBody = {
      products: [
        {
          item_id: 188,
          colors: parseInt(dynamicColors),
          quantities: [
            {
              quantity: parseInt(dynamicQuantity)
            }
          ]
        }
      ]
    };
    return bulkRequestBody;
  }
}

function getRoute(type) {
  if (type.toLowerCase() === "pack") {
    return baseUrl + "/pack-multiple-price/";
  } else {
    return baseUrl + "/bulk-pricing/";
  }
}
// Calculator Function
async function fetchSwagPrices(dynamicColors, dynamicQuantity, type) {
  const prevCost = resultInput.innerText;
  resultInput.innerText = "...";
  let body = JSON.stringify(
    makeRequestBody(dynamicColors, dynamicQuantity, type)
  );
  let url = getRoute(type);
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1"
      },
      referrer: "https://www.swagup.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: body,
      method: "POST",
      mode: "cors",
      credentials: "omit"
    });

    let pricing = await res.json();
    if (selectedPricingType.toLowerCase() === "pack") {
      resultInput.innerText = "$ " + pricing.quantities[0].price;
    } else {
      resultInput.innerText = "$ " + pricing.products[0].quantities[0].price;
    }
  } catch (error) {
    resultInput.innerText = prevCost;
  }
}

// Set up event listeners

quantitySlider.addEventListener("input", (e) => {
  quantityInput.innerText = parseInt(e.target.value);
});

colorSlider.addEventListener("input", (e) => {
  colorInput.innerText = parseInt(e.target.value);
});

quantitySlider.addEventListener("change", async (e) => {
  await fetchSwagPrices(
    colorSlider.value,
    quantitySlider.value,
    selectedPricingType
  );
});

colorSlider.addEventListener("change", async (e) => {
  await fetchSwagPrices(
    colorSlider.value,
    quantitySlider.value,
    selectedPricingType
  );
});

// Shipping price calculator code Start

document.querySelectorAll('input[name="type"]').forEach(function (radio) {
  radio.addEventListener("change", (e) => {
    handleRadioChange();
  });
});

var selectedShippingType = "Pack";

// Text-block and elements with IDs for the new form
var shippingTypeTextBlock = document.getElementById("shipping-type-text");
var shippingPackRadio = document.getElementById("shipping-pack");
var shippingBulkRadio = document.getElementById("shipping-bulk");
var shippingPackElement = document.getElementById("shipping-packElement");
var shippingBulkElement = document.getElementById("shipping-bulkElement");

// Inputs and select elements
var shippingResult = document.getElementById("shipping-result");
var countrySelect = document.getElementById("country");
var provinceInput = document.getElementById("province");
var stateSelect = document.getElementById("state");
var shippingQuantityInput = document.getElementById("shipping-quantity");
var zipCodeInput = document.getElementById("zipcode");
var calculateButton = document.getElementById("shipping-calculate");

// Setting default values and text for the new form
shippingQuantityInput.value = 1;
shippingTypeTextBlock.textContent = "Pack Quantity"; // Setting default text
shippingPackElement.classList.add("is-active"); // Setting default state
shippingBulkElement.classList.remove("is-active"); // Setting default state
shippingResult.innerText = "$ 00.00"; // Setting default value
calculateButton.classList.add("is-disabled"); // Set button as disabled by default
calculateButton.disabled = true; // Disabling button click

let countries = [];
async function getCountires() {
  let res = await fetch("https://api.swagup.com/api/v1/countries/");
  let data = await res.json();
  countries = data.results;
  return data.results;
}

async function domOps() {
  let countries = await getCountires();
  countrySelect.innerHTML = countries.map((country) => {
    return `<option value=${country.id}>${country.name}</option>`;
  });
  countrySelect.selectedIndex = 0;
}

function generateShippingPriceBody(zip, state, country, type) {
  let quantity;
  let product_type;
  if (type.toLowerCase() === "pack") {
    quantity = {
      pack_template: 11,
      quantity: parseInt(shippingQuantityInput.value)
    };
    product_type = "Pack";
  } else {
    quantity = {
      item: 188,
      quantity: parseInt(shippingQuantityInput.value)
    };
    product_type = "Item";
  }
  const body = {
    shipping_country: country,
    shipping_zip: zip,
    shipping_state: state,
    shipping_address1: "Fake Address",
    shipping_address2: "Fake Address",
    shipping_city: "Fake City",
    shopping_state: "",
    quantities: [quantity],
    product_type: product_type
  };
  return JSON.stringify(body);
}

function getCountryById(id) {
  return countries.find((country) => country.id.toString() === id);
}

function calculateTotalAmount(data) {
  let totalAmount = 0;
  for (let item of data) {
    totalAmount += item.total_price;
  }
  return totalAmount.toFixed(2);
}

async function getShippingPrices() {
  if (calculateButton.disabled) {
    return;
  }
  shippingResult.innerText = "...";
  let selectedCountry = getCountryById(countrySelect.value);
  const body = generateShippingPriceBody(
    zipCodeInput.value,
    stateSelect.value,
    selectedCountry.iso2,
    selectedShippingType
  );

  try {
    let res = await fetch("https://api.swagup.com/api/v1.01/shipping-prices/", {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1"
      },
      referrer: "https://www.swagup.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: body,
      method: "POST",
      mode: "cors",
      credentials: "omit"
    });
    let data = await res.json();
    const price = calculateTotalAmount(
      data.delivery_methods[0].prices.breakdown
    );
    if (price !== 0 && price) {
      shippingResult.innerText = "$ " + price.toLocaleString("en-US");
    } else {
      shippingResult.innerText = "";
    }
  } catch (error) {
    shippingResult.innerText = "";
  }
}

function checkFormCompletion() {
  var provinceStateFilled =
    (provinceInput.value && provinceInput.classList.contains("is-hidden")) ||
    (stateSelect.value &&
      stateSelect.parentElement.classList.contains("is-hidden")) ||
    (provinceInput.value && !provinceInput.classList.contains("is-hidden")) ||
    (stateSelect.value &&
      !stateSelect.parentElement.classList.contains("is-hidden"));

  var isFormComplete =
    shippingQuantityInput.value &&
    countrySelect.value &&
    zipCodeInput.value.length >= 4 && zipCodeInput.value.length <= 10
    provinceStateFilled;

  if (isFormComplete) {
    calculateButton.classList.remove("is-disabled");
    calculateButton.disabled = false;
  } else {
    calculateButton.classList.add("is-disabled");
    calculateButton.disabled = true;
  }
}

function renderInputOrDropdown(countryObject) {
  if (
    Array.isArray(countryObject.provinces) &&
    countryObject.provinces.length === 0
  ) {
    stateSelect.parentElement.classList.add("is-hidden");
    provinceInput.classList.remove("is-hidden");
  } else {
    console.log(countryObject.provinces);
    stateSelect.innerHTML = countryObject.provinces.map((province) => {
      return `<option value=${province.code}>${province.name}</option>`;
    });
    stateSelect.selectedIndex = 0;
    stateSelect.parentElement.classList.remove("is-hidden");
    provinceInput.classList.add("is-hidden");
  }
}

function handleCountryChange() {
  let selectedCountry = getCountryById(countrySelect.value);
  renderInputOrDropdown(selectedCountry);
}

// Function to handle radio change for the new form
function handleShippingRadioChange() {
  var shippingTypeRadio = document.querySelector(
    'input[name="shipping-type"]:checked'
  );

  if (shippingTypeRadio) {
    selectedShippingType = shippingTypeRadio.value;
    shippingTypeTextBlock.textContent =
      shippingTypeRadio.value === "Pack" ? "Pack Quantity" : "Item Quantity";

    if (shippingTypeRadio.value === "Pack") {
      shippingPackElement.classList.add("is-active");
      shippingBulkElement.classList.remove("is-active");
    } else {
      shippingPackElement.classList.remove("is-active");
      shippingBulkElement.classList.add("is-active");
    }
  }
  checkFormCompletion();
  getShippingPrices();
}

// Set up event listeners for the new form
document
  .querySelectorAll('input[name="shipping-type"]')
  .forEach(function (radio) {
    radio.addEventListener("change", handleShippingRadioChange);
  });

countrySelect.addEventListener("change", handleCountryChange);

calculateButton.addEventListener("click", () => {
  getShippingPrices();
});

[shippingQuantityInput, provinceInput, stateSelect, zipCodeInput].forEach(
  function (input) {
    input.addEventListener("input", checkFormCompletion);
  }
);
