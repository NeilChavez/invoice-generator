const d = document;
const $imageDropArea = d.getElementById("image-drop-area"),
  $form = d.getElementById("form"),
  $chooseFile = d.getElementById("choose-file"),
  $previewBtn = d.getElementById("btn-preview"),
  $btnModifyDate = d.querySelector(".modify-date"),
  $btnPreviewPrint = d.querySelector(".btn-final-wrapper"),
  $dateToday = d.getElementById("today-date"),
  $addItem = d.getElementById("add-item"),
  $descriptionDetails = d.querySelector(".grid-description"),
  $infoUpload = d.querySelector(".info-upload"),
  $SubtotalDigit = d.querySelector(".subtotal-digit"),
  $totalDescription = d.querySelector(".total"),
  $taxDigit = d.querySelector(".tax-digit"),
  $VATDigit = d.querySelector(".vat-digit"),
  $total = d.querySelector(".total-digit"),
  $tax = d.querySelector(".tax"),
  $header = d.querySelector(".header"),
  $btnHamgurger = d.querySelector('.hamburger'),
  $navList = d.querySelector('.nav-list');

// the invoice items entered by the user will be stored in this array.
let items = [];

// Definition of the construction function that allows the instance of new elements that will be instantiated when the user will insert a new article
function Item(text = "", quantity = 1, unitPrice = 0, VAT = 0) {
  this.text = text;
  this.quantity = Number(quantity);
  this.unitPrice = Number(unitPrice);
  this.VATPercentage = Number(Math.abs(VAT / 100));
}
Item.prototype.getAmount = function () {
  return (this.VATPercentage * this.unitPrice + this.unitPrice) * this.quantity;
};
Item.prototype.getSubtotal = function () {
  return this.quantity * this.unitPrice;
};
Item.prototype.getVAT = function () {
  return this.VATPercentage * this.unitPrice * this.quantity;
};

//add a new input line for a description, price and VAT
const addInput = (values) => {
  let { parent, description, quantity, unitPrice, VAT } = values;
  const $inputArea = d.createElement("article");

  $inputArea.innerHTML = `
  <article class="details-content grid-details">
      <div>
       <input type="text" class="description" data-preview value="${description}"/>
    </div>
    <div>
      <input type="text" class="quantity" data-preview value="${quantity}"/>
    </div>
    <div>
      <input type="text" class="unit-price" data-preview value="${unitPrice}" />
    </div>
    <div>
      <input type="text" class="VAT" data-preview value="${VAT * 100}" />
    </div>
    <div class="amount-wrapper">
    <span class="amount"> € 00.00</span>
    <i class="ri-delete-bin-line delete" data-preview></i>
  </div>
    </div>
  </article>
  `;
  parent.appendChild($inputArea);
};
//shows the total of the sum of the item of the row entered by the user, then the total amount for each row
const insertSum = (itemsArray) => {
  const $amount = d.querySelectorAll(".amount");
  itemsArray.forEach((item, index) => {
    const amount = item.getAmount();
    $amount[index].innerText = `€ ${amount.toFixed(2)}`;
  });
};
// inserts the sum of the subtotal into the summary grid.
const insertSubtotal = (itemsArray) => {
  let subtotal = 0;

  itemsArray.forEach((el) => {
    subtotal += el.getSubtotal();
  });

  $SubtotalDigit.innerText = `€ ${subtotal.toFixed(2)}`;
};
// this function takes as parameter an object that contains the different VAT rates added together and renders them
const renderVAT = (VATPartials) => {
  const $taxes = d.querySelectorAll(".tax"),
    $taxDigits = d.querySelectorAll(".tax-digit");

  $taxes.forEach((tax) => tax.remove());
  $taxDigits.forEach((taxDigits) => taxDigits.remove());

  for (const [key, value] of Object.entries(VATPartials)) {
    const $tax = d.createElement("div"),
      $taxDigit = d.createElement("div");
    $tax.classList.add("tax");
    $taxDigit.classList.add("tax-digit");
    $tax.innerText = `${(Number(key) * 100).toFixed(0)} %`;
    $taxDigit.innerText = `€ ${value.toFixed(2)}`;

    $totalDescription.insertAdjacentElement("beforebegin", $tax);
    $totalDescription.insertAdjacentElement("beforebegin", $taxDigit);
  }
};
// this function collects the VAT in an object, if the rates are different, it groups them and adds them
const insertVAT = (itemsArray) => {
  const VATPartials = itemsArray.reduce((obj, item) => {
    if (obj[item.VATPercentage]) {
      obj[item.VATPercentage] += item.getVAT();
    } else {
      obj[item.VATPercentage] = item.getVAT();
    }

    return obj;
  }, new Object());

  renderVAT(VATPartials);
};

// this function inserts the total amount to be paid, so it is the "Total"
const inserTotal = (itemsArray) => {
  let total = 0;
  itemsArray.forEach((item) => {
    total += item.getAmount();
  });

  $total.innerText = `€ ${total.toFixed(2)}`;
};

if (localStorage.getItem("items")) {
  let items = JSON.parse(localStorage.getItem("items"));


  let itemsToDisplay = [];
  items.forEach((el) => {
    const item = new Item(
      el.text,
      el.quantity,
      el.unitPrice,
      el.VATPercentage * 100
    );

    itemsToDisplay.push(item);
  });

  itemsToDisplay.forEach((el) => {
    const values = {
      parent: $descriptionDetails,
      description: el.text,
      quantity: el.quantity,
      unitPrice: el.unitPrice,
      VAT: el.VATPercentage
    }

    addInput(values);
  });

  insertSum(itemsToDisplay);
  insertSubtotal(itemsToDisplay);
  insertVAT(itemsToDisplay);
  inserTotal(itemsToDisplay);
}

// function to render the image loaded by the user, interpreting it with the FileReader object
const renderFile = (parent, file) => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const $img = d.createElement("img");
    $img.setAttribute("src", reader.result);
    $img.classList.add("logo");
    parent.appendChild($img);
  };
};
// remove the previous image if there was one
const removePrevius = () => {
  $logoImg = d.querySelector(".image-drop-area img");
  if ($logoImg) {
    $logoImg.remove();
    $infoUpload.classList.remove("hide");
  }
};
//render today's date
const renderDate = () => {
  let now = new Date();
  return now.toLocaleDateString();
};

// this instantiates a new Item entered by the user, and adds it to in the array list
const addItems = (values) => {
  let { text, quantity, unitPrice, VAT } = values;
  let obj = new Item(text, quantity, unitPrice, VAT);
  items.push(obj);
};

// this function collects all the values ​​present in the input of the invoice details, the description, the quantity value, the price value, the VAT value, and enters the sums of the updated values ​​in the summary grid, finally, it saves all the current array in the local storage of the user's browser
const collectValueInputs = () => {
  items = [];

  const $descriptions = d.querySelectorAll(".description"),
    $quantities = d.querySelectorAll(".quantity"),
    $unitPrices = d.querySelectorAll(".unit-price"),
    $VATValues = d.querySelectorAll(".VAT");

  $descriptions.forEach((description, index) => {
    const values = {
      text: description.value,
      quantity: $quantities[index].value,
      unitPrice: $unitPrices[index].value,
      VAT: $VATValues[index].value
    };
    addItems(values);
    insertSum(items);
    insertSubtotal(items);
    insertVAT(items);
    inserTotal(items);
  });

  console.log(items);
  localStorage.setItem("items", JSON.stringify(items));
};

$dateToday.innerText = `${renderDate()}`;

// user modifies the date
$btnModifyDate.addEventListener("click", e => {
  e.preventDefault();
  const $inputDate = d.createElement("input");
  $inputDate.setAttribute("type", "date");
  $dateToday.replaceWith($inputDate);
});

// the user can drag the image of his company logo, to put it in the header of the invoice
$imageDropArea.addEventListener("dragover", e => {
  e.preventDefault();
});
$imageDropArea.addEventListener("drop", function (e) {
  e.preventDefault();
  removePrevius();
  let file = e.dataTransfer.files[0];
  renderFile(this, file);
  $infoUpload.classList.add("hide");
});

$imageDropArea.addEventListener("change", function (e) {
  let imgLogo = $chooseFile.files[0];
  if (imgLogo) {
    renderFile(this, imgLogo);
  }
  $infoUpload.classList.add("hide");
});

$imageDropArea.addEventListener("click", e => {
  removePrevius();
});

$addItem.addEventListener("click", e => {
  e.preventDefault();
  const values = {
    parent: $descriptionDetails,
    description: "",
    quantity: 1,
    unitPrice: 1,
    VAT: 0
  };
  addInput(values);

});

$descriptionDetails.addEventListener("click", e => {
  if (e.target.matches(".delete")) {
    const $deleteIcons = d.querySelectorAll(".delete"),
      index = Array.from($deleteIcons).indexOf(e.target),
      detailsContent = d.querySelectorAll(".details-content");
    detailsContent[index].remove();
    collectValueInputs();
  }
});

$descriptionDetails.addEventListener("change", e => {
  collectValueInputs();
});

$btnPreviewPrint.addEventListener("click", e => {
  e.preventDefault();

  if (e.target.matches(".btn-preview")) {
    const $previewElements = d.querySelectorAll("[data-preview]");
    $previewElements.forEach((el) => el.classList.toggle("preview"));
  }
  if (e.target.matches(".btn-save-pdf")) {
    window.print();
  }
});

// Hamburger menu 
d.addEventListener('click', e => {
  if ($btnHamgurger.classList.contains('is-active')) {
    $btnHamgurger.classList.remove('is-active')
    $navList.classList.remove("is-active");
    return;
  }
  if (e.target.matches(".hamburger-wrapper") || e.target.matches(".hamburger-wrapper *")) {
    $btnHamgurger.classList.toggle('is-active')
    $navList.classList.toggle("is-active");
    return;
  }
  if (e.target.matches(".list-item") || e.target.matches(".list-item *")) {
    $btnHamgurger.classList.remove('is-active')
    $navList.classList.remove("is-active");
    return;
  }
})
