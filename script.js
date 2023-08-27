function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// observer

async function handleIntersection(entry) {
    if (entry.isIntersecting) {
        entry.target.classList.add('shown');

        switch (entry.target.id) {
            case 'header':
                await delay(1000)
                adjustTransitionDuration(entry.target, 250);
                break

            case 'stats':
                animateProgress(true)
                break
        }
    } else {
        entry.target.classList.remove('shown');
        switch (entry.target.id) {
            case 'header':
                adjustTransitionDuration(entry.target, 1000)
                break
            case 'stats':
                resetProgress()
                break
        }
    }
}

function adjustTransitionDuration(header, duration) {
    header.querySelectorAll('nav a span').forEach(span => {
        span.style.transitionDuration = `${duration}ms`;
    })
}

const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => handleIntersection(entry));
})

const hidden_elements = document.querySelectorAll('.hidden');
hidden_elements.forEach((el) => intersectionObserver.observe(el));

// cursor

const cursor = document.getElementById('cursor');

document.addEventListener('touchstart', () => cursor.style.display = 'none');

document.addEventListener('mousemove', (e) => {
    cursor.style.top = e.y + 'px';
    cursor.style.left = e.x + 'px';
});

// navigator

const colored_text_vars = ['--red', '--orange', '--yellow', '--green', '--blue', '--purple']
let color_i = -1;

const hoverStyleColorSelect = () => {
    return colored_text_vars[(color_i = color_i === colored_text_vars.length - 1 ? 0 : ++color_i)]
}

const nav_list = document.querySelectorAll('header nav a')

const nav_text = nav_list.forEach(text => {
    text.innerHTML = text.innerText.split('').map((letters, i) => `<span style='transition-delay: ${i * 25}ms; --rainbow-color: var(${hoverStyleColorSelect()});'>${letters}</span>`).join('')
})

nav_list.forEach(element => {
    element.addEventListener('mouseenter', () => cursor.style.opacity = 0)
    element.addEventListener('mouseleave', () => cursor.style.opacity = 1)
})

nav_list.forEach(element => {
    intersectionObserver.observe(element)
})

// stats

/** @type {SVGCircleElement} */

const progress_circles = document.querySelectorAll('.progress_circle')
const percent_texts = document.querySelectorAll('.percent_text')

let radius = []
let u = []

function animateProgress(animate_text) {
    radius = []
    u = []
    progress_circles.forEach(async (e, i) => {
        radius.push(e.r.baseVal.value)
        u.push(radius[i] * 2 * Math.PI)

        let percent = progress_circles[i].parentNode.parentNode.dataset.percent

        progress_circles[i].style.transitionDelay = i * 200 + 'ms'
        progress_circles[i].style.strokeDasharray = u[i].toString()
        progress_circles[i].style.strokeDashoffset = u[i] - (u[i] / 100) * percent

        let curr_percent_text = 0
        let speed = 1000 / percent

        if (!animate_text) return

        await delay(i * 200)

        let count = setInterval(() => {
            percent_texts[i].innerText = curr_percent_text + '%'
            if (curr_percent_text === parseInt(percent)) clearInterval(count)
            curr_percent_text++
        }, speed)
    })
}

function resetProgress() {
    progress_circles.forEach((e, i) => {
        progress_circles[i].style.strokeDashoffset = u[i].toString()
    })
}

// socials

const social_links = document.querySelector('.social-links')

social_links.addEventListener('mouseenter', () => cursor.classList.add('social-cursor'))
social_links.addEventListener('mouseleave', () => cursor.classList.remove('social-cursor'))

// projects (cardslider)

const cardslider = document.getElementById('cardslider')
const cards = cardslider.querySelectorAll('div')
const previous_card = document.querySelector('.previous_card')
const next_card = document.querySelector('.next_card')

let element_active = 0

previous_card.addEventListener('click', () => {
    element_active--;
    if (element_active === -1) element_active = cards.length - 1
    slide()
})

next_card.addEventListener('click', () => {
    element_active++;
    if (element_active === cards.length) element_active = 0
    slide()
})

function slide() {
    cards[element_active].scrollIntoView({ block: 'nearest' })
}

// recommendations

const recom_childs = document.querySelectorAll('.recom-wrapper > div')

recom_childs.forEach((e) => {
    e.addEventListener('mouseenter', () => {
        e.style.width = `${e.children[0].getBoundingClientRect().width}px`
    })
    e.addEventListener('mouseleave', () => {
        e.style.width = '6rem'
    })
})

// mobile

const progress_tracks = document.querySelectorAll('.progress_track')
const svg_circles = [...progress_circles, ...progress_tracks]

const resizeObserver = new ResizeObserver((entries) => {
    window.matchMedia('(max-width: 88rem)').matches ? reanimate('72') : reanimate('96')
})

function reanimate(new_r) {
    svg_circles.forEach((circle) => circle.setAttribute('r', new_r))
    animateProgress(false)
}

resizeObserver.observe(document.body)