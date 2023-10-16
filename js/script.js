const API_URL = 'https://wonderful-showy-curio.glitch.me/'

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

            <button class="btn coctail__btn" data-id="${item.id}">
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

const modalController = ({modal, btnOpen, time = 300}) => {
    const buttonElem = document.querySelector(btnOpen)
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

        if (target === modalElem || code === 'Escape') {
            modalElem.style.opacity = 0

            setTimeout(() => {
                modalElem.style.visibility = 'hidden'
                scrollService.enabledScroll()
            }, time)
            window.removeEventListener('keydown', closeModal)
        }
    }

    const openModal = () => {
        modalElem.style.visibility = 'visible'
        modalElem.style.opacity = 1
        scrollService.disabledScroll()
        window.addEventListener('keydown', closeModal)
    }

    buttonElem.addEventListener('click', openModal)
    modalElem.addEventListener('click', closeModal) 

    return { openModal, closeModal }
}

const init = async () => {
    modalController({
        modal: '.modal_order',
        btnOpen: '.header__btn-order'
    })
    modalController({
        modal: '.modal_make',
        btnOpen: '.coctail__btn_make'
    })

    const goodsListEl = document.querySelector('.goods__list')

    const data = await getData()

    const cartsCocktail = data.map(item => {
        const li = document.createElement('li')
        li.classList.add('goods__item')
        li.append(createCard(item))

        return li
    })

    goodsListEl.append(...cartsCocktail)
}

init()
