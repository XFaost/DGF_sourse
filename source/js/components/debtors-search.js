import { disableScroll } from '../functions/disable-scroll';
import { enableScroll } from '../functions/enable-scroll';

let registersData = null;
let selectedRegister = null;
let overlay = document.querySelector('[data-overlay]');
let breakpointTablet = 768;
let identModal = document.querySelector('[data-ident-modal]');
let identMobileModal = document.querySelector('[data-ident-mobile]');

let debtorVatin = document.querySelector('[data-debtor-vatin]');
let debtorCaNumber = document.querySelector('[data-debtor-ca-number]');
let debtorsResult = document.querySelector('[data-debtors-result]');
let debtorsStartSearch = document.querySelector('[data-debtors-start-search]');
let debtorsClear = document.querySelector('[data-debtors-clear]');

const mobileRemoveClass = function(btns,modalBlock) {
    let containerWidth = document.documentElement.clientWidth;

    if (containerWidth < breakpointTablet) {
        btns.map(function(button){
            button.addEventListener('click', function() {
                modalBlock.classList.remove('active');
            });
        });
    }
}

const clearFields = () => {
    debtorVatin.value = '';
    debtorCaNumber.value = '';
}


const getRegisterById = (id) => {
    for(var register of registersData['results']) {
        if (register['id'] == id) {
            return register;
        }        
    }
    return null;
}

const showModal = function(overlayBg, button, modalBlock, registerId) {
    selectedRegister = getRegisterById(registerId);
    if (selectedRegister) {
        modalBlock.querySelector('.modal__title').innerHTML = `Пошук боржника у реєстрі ${selectedRegister['name']}`;
    }    
    overlayBg.classList.add('active');
    modalBlock.classList.add('active');
    disableScroll();
    clearFields();
    clearDebtorsTable();
}

const showMobileModal = function(overlayBg, button, modalBlock, registerId) {
    selectedRegister = getRegisterById(registerId);
    modalBlock.querySelector('.modal__title').innerHTML = `Картка ${selectedRegister['trademark']['name']}`;
    modalBlock.querySelector('.ident-mobile__image source').srcset = `${selectedRegister['trademark']['logo']['normal_webp']}`;
    modalBlock.querySelector('.ident-mobile__image img').src = `${selectedRegister['trademark']['logo']['normal']}`;
    modalBlock.querySelector('.ident-mobile__name').innerHTML = `ЄДРПОУ: ${selectedRegister['creditor']['edrpou']}`;
    modalBlock.querySelector('.ident-mobile__list').innerHTML = `
        <li class="ident-mobile__item">
            <span class="ident-mobile__title">
                Борг відступлено за договором:
            </span>
            <span class="ident-mobile__value">
                ${selectedRegister['contract']['number']}
            </span>
        </li>
        <li class="ident-mobile__item">
            <span class="ident-mobile__title">
                Договір заключено:
            </span>
            <span class="ident-mobile__value">
                ${selectedRegister['contract']['date']}
            </span>
        </li>
        <li class="ident-mobile__item">
            <span class="ident-mobile__title">
                Дата передачі реєстру:
            </span>
            <span class="ident-mobile__value">
                ${selectedRegister['date']}
            </span>
        </li>
    `;
    modalBlock.querySelector('.ident-mobile__btns').innerHTML = `
        <button class="ident-mobile__btn blue-btn" data-ident data-register-id="${selectedRegister['id']}">
            Шукати у реєстрі боржників
        </button>
        <a href="${selectedRegister['contract']['file']}" target="_blank" download class="ident-mobile__btn blue-btn-transparent">
            <svg width='18' height='18'>
                <use href="${static_files['sprite']}#type"></use>
            </svg>
            Скачати договір
        </a>
        <a href="${selectedRegister['trademark']['url']}" target="_blank" class="ident-mobile__btn blue-btn-transparent">
            Перейти до сторінки кредитора
        </a>
    `;
    overlayBg.classList.add('active');
    modalBlock.classList.add('active');
    disableScroll();
    clearFields();
    clearDebtorsTable();
    updateModalsEvents();
}

const hideModal = function(overlayBg,modalBlock) {
    overlayBg.classList.remove('active');
    modalBlock.classList.remove('active');
    enableScroll();
}

const hideModalHandler = function(parrent) {
    const closeBtn = parrent.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        hideModal(overlay,parrent);
    });
}

const mobileCheck = function(buttons) {
    let containerWidth = document.documentElement.clientWidth;

    if (containerWidth < breakpointTablet) {
        buttons.map(function(btn) {
            btn.addEventListener('click', function(e) {
                showMobileModal(overlay, btn, identMobileModal, btn.dataset.registerId);
            })
        });
    }
}

const plunkModalBtns = function(btns, overlayBg, modalBlock){
    btns.map(function(btn){
        btn.addEventListener('click', function(e) {
            showModal(overlayBg, btn, modalBlock, btn.dataset.registerId);
        })
    });
}

const updateMobileModalEvents = () => {
    let identBtnsMobile = [...document.querySelectorAll('.ident-mobile [data-ident]')];
    let identMobileButtons = [...document.querySelectorAll('[data-mobile-ident]')];
    mobileCheck(identMobileButtons);
    mobileRemoveClass(identBtnsMobile, identMobileModal);
}

window.addEventListener('resize', () => {
    updateMobileModalEvents();
});

const updateModalsEvents = () => {
    if (overlay) {
        let identBtns = [...document.querySelectorAll('[data-ident]')];

        updateMobileModalEvents();        
        plunkModalBtns(identBtns, overlay, identModal);
    
        hideModalHandler(identMobileModal);
        hideModalHandler(identModal);
    
        overlay.addEventListener('click', function(e) {
            if (e.target.classList.contains('overlay')) {
                hideModal(overlay,identModal);
            }
        });
    }
}

let registersSearchField = document.querySelector('[data-registers-search-field]');
let registersStartSearch = document.querySelector('[data-registers-start-search]');
let registersClear = document.querySelector('[data-registers-clear]');
let registersResult = document.querySelector('[data-registers-result]');

const clearRegistersTable = () => {
    const rows = registersResult.getElementsByClassName('ident-list__row');
    while(rows.length > 1){
        rows[1].parentNode.removeChild(rows[1]);
    }
}

const setRegistersTable = () => {
    if(registersData['results'].length == 0) {
        registersResult.innerHTML += `
            <li class="ident-list__row" style="grid-template-columns: 1fr">
                <div class="ident-list__coll">
                    По запиту нічого не знайдено
                </div>
            </li>
        `;
    }
    else {
        for(var register of registersData['results']) {
            registersResult.innerHTML += `
                <li class="ident-list__row">
                    <a href="#" class="ident-list__coll">
                        <picture>
                            <source type='image/webp' srcset='${register['trademark']['logo']['normal_webp']}'>
                            <img width='200' height='50' src='${register['trademark']['logo']['normal']}' alt='logo'>
                        </picture>
                    </a>
                    <button data-mobile-ident data-register-id="${register['id']}">Open mobile modal</button>
                    <span class="ident-list__coll">
                        <span class="ident-list__coll-name">${register['trademark']['name']}</span>
                        <span class="ident-list__coll-value">(ЄДРПОУ: ${register['creditor']['edrpou']})</span>
                    </span>
        
                    <span class="ident-list__coll">
                        ${register['contract']['number']}
                    </span>
        
                    <span class="ident-list__coll">
                        ${register['contract']['date']}
                    </span>
        
                    <span class="ident-list__coll">
                        ${register['date']}
                    </span>
                    <div class="ident-list__hide">
                        <div class="ident-list__wrapper">
                            <button class="ident-list__hide-btn" data-ident data-register-id="${register['id']}">
                                Шукати у реєстрі боржників
                            </button>
                            <a href="${register['contract']['file']}" target="_blank" download class="ident-list__hide-btn">
                                <svg width='18' height='18'>
                                    <use href='${static_files['sprite']}#type'></use>
                                </svg>
                                Скачати договір
                            </a>
                            <a href="${register['trademark']['url']}" target="_blank" class="ident-list__hide-btn">
                                Перейти до сторінки кредитора
                            </a>
                        </div>
                    </div>
        
                </li>
            `;
        }
    }    
    updateModalsEvents();
}

const registersGetAsync = (callback, searchValue) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            registersData = JSON.parse(xmlHttp.responseText);
            callback();
        }
    }
    xmlHttp.open("GET", `/api/v1/registers/?v=${searchValue}`, true); 
    xmlHttp.send(null);
}



if(registersSearchField) {
    registersStartSearch.addEventListener('click', function(e){
        clearRegistersTable();
        registersGetAsync(setRegistersTable, registersSearchField.value);
    });
    
    registersSearchField.addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            registersStartSearch.click();
        }
    });
    
    registersClear.addEventListener('click', function(e){
        clearRegistersTable();
        registersSearchField.value = '';
        registersGetAsync(setRegistersTable, registersSearchField.value);
    })

    registersGetAsync(setRegistersTable, registersSearchField.value);
}



const checkDebtorsFields = () => {
    debtorVatin.classList.remove("error");
    debtorCaNumber.classList.remove("error");

    let vatin = debtorVatin.value;
    let caNumber = debtorCaNumber.value;
    let allGood = true;

    if(vatin.length == 0 && caNumber.length == 0) {
        allGood = false;
    }
    else {
        if(vatin.length > 0 && vatin.length != 10) {
            debtorVatin.classList.add("error");
            allGood = false;
        }
        if(caNumber.length > 0 && caNumber.length > 15) {
            debtorCaNumber.classList.add("error");
            allGood = false;
        }
    }    

    return allGood;
}

const clearDebtorsFields = () => {
    debtorVatin.value = '';
    debtorCaNumber.value = '';
}

const clearDebtorsTable = () => {
    debtorsResult.innerHTML = '';
}

const setDebtorsTable = (data) => {
    debtorsResult.innerHTML += `
        <span class="search-result__title">
            Результати пошуку:
        </span>
    `;
    if(data['results'].length == 0) {
        debtorsResult.innerHTML += `
            <span>
                По запиту нічого не знайдено
            </span>
        `;
    }
    else {
        for(var debtor of data['results']) {
            debtorsResult.innerHTML += `
                <ul class="search-result__table">
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            ПІБ боржника
                        </span>
                        <span class="search-result__value">
                            ${debtor['fullname']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Реєстраційний номер облікової картки платника податків
                        </span>
                        <span class="search-result__value">
                            ${debtor['vatin']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Номер кредитного договору
                        </span>
                        <span class="search-result__value">
                            ${debtor['ca_number']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Дата кредитного договору
                        </span>
                        <span class="search-result__value">
                            ${debtor['ca_date']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Заборгованість по основному боргу (тіло кредиту), ₴
                        </span>
                        <span class="search-result__value">
                            ${debtor['bloan']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Заборгованістьпо відсоткам, ₴
                        </span>
                        <span class="search-result__value">
                            ${debtor['interest_arrears']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Комісія, ₴
                        </span>
                        <span class="search-result__value">
                            ${debtor['commission']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Пеня, ₴
                        </span>
                        <span class="search-result__value">
                            ${debtor['fine']}
                        </span>
                    </li>
                    <li class="search-result__coll">
                        <span class="search-result__name">
                            Загальная заборгованість, ₴
                        </span>
                        <span class="search-result__value">
                            ${debtor['total_debt']}
                        </span>
                    </li>
                </ul>
            `;
        }
    }
    
}

const debtorsGetAsync = (callback, vatin, caNumber) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    }
    xmlHttp.open("GET", `/api/v1/debtors/?register=${selectedRegister['id']}&vatin=${vatin}&ca_number=${caNumber}`, true); 
    xmlHttp.send(null);
}

if (debtorsStartSearch) {
    debtorsStartSearch.addEventListener('click', () => {
        clearDebtorsTable();
        if(!checkDebtorsFields()) {
            return;
        }
    
        debtorsGetAsync(setDebtorsTable, debtorVatin.value, debtorCaNumber.value);
    });
    
    debtorVatin.addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            debtorsStartSearch.click();
        }
    });
    
    debtorCaNumber.addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            debtorsStartSearch.click();
        }
    });    
    
    debtorsClear.addEventListener('click', () => {
        clearDebtorsTable();
        clearDebtorsFields();    
    });
}

