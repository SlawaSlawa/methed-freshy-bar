const API_URL = 'https://wonderful-showy-curio.glitch.me/'

const price = {
    'Клубника': 60, 
    'Банан': 50,
    'Манго': 70,
    'Киви': 55,
    'Маракуйя': 90, 
    'Яблоко': 45,
    'Мята': 50,
    'Лед': 10,
    'Биоразлагаемый': 20,
    'Пластиковый': 0,
}

const cartDataControl = {
    get() {
        return JSON.parse(localStorage.getItem('freshyBarCart') || '[]')
    },
    add(item) {
        const cartData = this.get()
        item.idls = Math.random().toString(36).substring(2, 8)
        cartData.push(item)
        localStorage.setItem('freshyBarCart', JSON.stringify(cartData))
    },
    remove(idls) {
        const cartData = this.get()
        const index = cart.findIndex((item) => item.idls === idls)
        if (index !== -1) {
            cartData.splice(index, 1)
        }
        localStorage.setItem('freshyBarCart', JSON.stringify(cartData))
    },
    clear() {
        localStorage.removeItem('freshyBarCart')
    }
}

const getData = async () => {
    const response = await fetch(`${API_URL}api/goods`)
    const data = await response.json()
    return data
}

const createCard = (item) => {
    const { image, title, price, size } = item
    const cocktail = document.createElement('article')
    cocktail.classList.add('coctail')

    cocktail.innerHTML = `
        <img
            src="${image.replace('img/', 'images/goods/')}"
            alt="Коктейль: ${title}"
            class="coctail__img"
        />
        <div class="coctail__content">
            <div class="coctail__text">
                <h3 class="coctail__title">
                    ${title}
                </h3>
                <p class="coctail__price text-red">
                    ${price} ₽
                </p>
                <p class="coctail__size">${size}</p>
            </div>

            <button class="btn coctail__btn coctail__btn_add" data-id="${item.id}">
                Добавить
            </button>
        </div>
    `
    return cocktail
}

const scrollService = {
    scrollPosition: 0,
    disabledScroll() {
        this.scrollPosition = window.scrollY
        document.documentElement.style.scrollBehavior = 'auto'
        document.body.style.cssText = `
            overflow: hidden;
            position: fixed;
            top: -${this.scrollPosition}px;
            left: 0;
            height: 100vh;
            width: 100vw;
            padding-right: ${window.innerWidth - document.body.offsetWidth}px;
        `
    },
    enabledScroll() {
        document.body.style.cssText = ''
        window.scroll({ top: this.scrollPosition })
        document.documentElement.style.scrollBehavior = ''
    }
}

const modalController = ({modal, btnOpen, time = 300, open, close}) => {
    const buttonElems = document.querySelectorAll(btnOpen)
    const modalElem = document.querySelector(modal)
    
    modalElem.style.cssText = `
        display: flex;
        visibility: hidden;
        opacity: 0;
        transition: opacity ${time}ms ease-in-out;
    `

    const closeModal = (evt) => {
        const target = evt.target
        const code = evt.code

        if (evt === 'close' || target === modalElem || code === 'Escape') {
            modalElem.style.opacity = 0

            setTimeout(() => {
                modalElem.style.visibility = 'hidden'
                scrollService.enabledScroll()

                if (close) {
                    close()
                }
            }, time)
            window.removeEventListener('keydown', closeModal)
        }
    }

    const openModal = (e) => {
        if (open) {
            open({btn: e.target})
        }
        modalElem.style.visibility = 'visible'
        modalElem.style.opacity = 1
        scrollService.disabledScroll()
        window.addEventListener('keydown', closeModal)
    }

    buttonElems.forEach(buttonElem => {
        buttonElem.addEventListener('click', openModal)
    })
    
    modalElem.addEventListener('click', closeModal) 

    modalElem.closeModal = closeModal
    modalElem.openModal = openModal

    return { openModal, closeModal }
}

const getFormData = (form) => {
    const formData = new FormData(form)
    const data = {}
    for (const [name, value] of formData.entries()) {
        if (data[name]) {
            if (!Array.isArray(data[name])) {
                data[name] = [data[name]]
            }
            data[name].push(value)
        } else {
            data[name] = value
        }
    }

    return data
}

const calculateTotalPrice = (form, startPrice) => {
    let totalPrice = startPrice
    const data = getFormData(form)

    if (Array.isArray(data.ingredients)) {
        data.ingredients.forEach(item => {
            totalPrice += price[item] || 0
        })
    } else {
        totalPrice += price[data.ingredients] || 0
    }

    if (Array.isArray(data.topping)) {
        data.topping.forEach(item => {
            totalPrice += price[item] || 0
        })
    } else {
        totalPrice += price[data.topping] || 0
    }

    totalPrice += price[data.cup] || 0

    return totalPrice
}

const formControl = (form, cb) => {
    form.addEventListener('submit', (e) => {
        e.preventDefault()

        const data = getFormData(form)
        cartDataControl.add(data)

        if (cb) {
            cb()
        }
    })
}

const calculateMakeYourOwn = () => {
    const modalMakeOwn = document.querySelector('.modal_make-your-own')
    const makeInputTitle = modalMakeOwn.querySelector('.make__input-title')
    const formMakeOwn = modalMakeOwn.querySelector('.make__form_make-your-own')
    const makeInputPrice = modalMakeOwn.querySelector('.make__input_price')
    const makeTotalPrice = modalMakeOwn.querySelector('.make__total_price')
    const makeAddBtn = modalMakeOwn.querySelector('.make__add-btn')

    handlerChange = () => {
        const totalPrice = calculateTotalPrice(formMakeOwn, 150)

        const data = getFormData(formMakeOwn)

        if (data.ingredients) {
            const ingredients = Array.isArray(data.ingredients)
                ? data.ingredients.join(', ')
                : data.ingredients

            makeInputTitle.value = `Конструктор: ${ingredients}`
            makeAddBtn.disabled = false
        } else {
            makeAddBtn.disabled = true
        }

        makeInputPrice.value = totalPrice
        makeTotalPrice.textContent = `${totalPrice} ₽`
    }

    formMakeOwn.addEventListener('change', handlerChange)
    formControl(formMakeOwn, () => {
        modalMakeOwn.closeModal('close')
    })
    handlerChange()

    const resetForm = () => {
        makeTotalPrice.textContent = ''
        makeAddBtn.disabled = true
        formMakeOwn.reset()
    }

    return { resetForm }
}

const calculateAdd = () => {
    const modalAdd = document.querySelector('.modal_add')
    const formAdd = modalAdd.querySelector('.make__form_add')
    const makeTitle = modalAdd.querySelector('.make__title')
    const makeInputTitle = modalAdd.querySelector('.make__input-title')
    const makeTotalPrice = modalAdd.querySelector('.make__total_price')
    const makeInputStartPrice = modalAdd.querySelector('.make__input-start-price')
    const makeInputPrice = modalAdd.querySelector('.make__input-price')
    const makeTotalSize = modalAdd.querySelector('.make__total_size')
    const makeInputSize = modalAdd.querySelector('.make__input-size')

    const handlerChange = () => {
        const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value)
        makeTotalPrice.innerHTML = `${totalPrice}&nbsp;₽`
        makeInputPrice.value = totalPrice
    }

    formAdd.addEventListener('change', handlerChange)
    formControl(formAdd, () => {
        modalAdd.closeModal('close')
    })

    const fillInForm = data => {
        makeTitle.textContent = data.title
        makeInputTitle.value = data.title
        makeTotalPrice.innerHTML = `${data.price}&nbsp;₽`
        makeInputPrice.value = data.price
        makeInputStartPrice.value = data.price
        makeTotalSize.textContent = data.size
        makeInputSize.value = data.size
        handlerChange()
    }

    const resetForm = () => {
        makeTitle.textContent = ''
        makeTotalPrice.textContent = ''
        makeTotalSize.textContent = ''
        formAdd.reset()
    }

    return {fillInForm, resetForm}
}

const createCardItem = (item) => {
    const li = document.createElement('li')
    li.classList.add('order__item')
    li.innerHTML = `
        <img
            class="order__img"
            src="images/goods/make-your-own.jpg"
            alt="${item.title}"
        />

        <div class="order__info">
            <h3 class="order__name">
                ${item.title}
            </h3>

            <ul class="order__topping-list">
                <li class="order__topping-item">${item.size}</li>
                <li class="order__topping-item">
                    ${item.cup}
                </li>
                    ${item.topping ? (Array.isArray(item.topping)
                        ? item.topping.map(topping => `<li class="order__topping-item">${topping}</li>`)
                        : `<li class="order__topping-item">${item.topping}</li>`)
                        : ''
                    } 
                
            </ul>
        </div>

        <button
            class="order__item-delete"
            data-idls="${item.idls}"
            aria-label="Удалить кокьейль из корзины"
        ></button>
        <p class="order__item-price">${item.price}&nbsp;₽</p>
    `

    return li
}

const renderCart = () => {
    const modalOrder = document.querySelector('.modal_order')

    const orderCount = modalOrder.querySelector('.order__count')
    const orderList = modalOrder.querySelector('.order__list')
    const orderTotalPrice = modalOrder.querySelector('.order__total-price')
    const orderForm = modalOrder.querySelector('.order__form')

    const orderListData = cartDataControl.get()

    orderList.textContent = ''
    orderCount.textContent = `(${orderListData.length})`

    orderListData.forEach(item => {
        orderList.append(createCardItem(item))
    })

    orderTotalPrice.textContent = `${orderListData.reduce((acc, item) => acc + +item.price, 0)} ₽`

    orderForm.addEventListener('submit', async (evt) => {
        evt.preventDefault()
        if (!orderListData.length) {
            alert('Корзина пуста')
            orderForm.reset()
            modalOrder.closeModal('close')
            return
        }

        const data = getFormData(orderForm)
        const response = await fetch(`${API_URL}api/order`, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                products: orderListData,
            }),
            headers: {
                "Content-Type": 'application/json'
            }
        })

        const {message} = await response.json()

        alert(message)
        cartDataControl.clear()
        orderForm.reset()
        modalOrder.closeModal('close')
    })
}

const init = async () => {
    modalController({
        modal: '.modal_order',
        btnOpen: '.header__btn-order',
        open: renderCart,
    })

    const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn()

    const goodsListEl = document.querySelector('.goods__list')

    const data = await getData()

    const cartsCocktail = data.map(item => {
        const li = document.createElement('li')
        li.classList.add('goods__item')
        li.append(createCard(item))

        return li
    })

    goodsListEl.append(...cartsCocktail)

    modalController({
        modal: '.modal_make-your-own',
        btnOpen: '.coctail__btn_make',
        close: resetFormMakeYourOwn,
    })

    const {fillInForm: fillInFormAdd, resetForm: resetFormAdd} =  calculateAdd()

    modalController({
        modal: '.modal_add',
        btnOpen: '.coctail__btn_add',
        open({btn}) {
            const id = btn.dataset.id
            const item = data.find(item => item.id.toString() === id)
            fillInFormAdd(item)
        },
        close() {
            resetFormAdd()
        }
    })
}

init()
