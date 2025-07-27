// Variabili globali
let currentSlide = 0;
let currentQuestion = 1;
let quizAnswers = {};
let countdownInterval;
let selectedProductIndex = 0; // Indice del prodotto selezionato
let isTouch = false; // Определяем переменную для отслеживания touch-устройств

// Prodotti
const products = [
    {
        id: 1,
        name: "Viagra Connect Bundle",
        price: "€2,00",
        originalPrice: "€53,99",
        image: "assets/images/viagra/viagra_connect_bundle.webp",
        description: "Un set completo per il benessere maschile che include supporto naturale, preservativi premium con texture speciali e lubrificante di alta qualità."
    },
    {
        id: 2,
        name: "Lovehoney Indulge Sex Toy Advent Calendar",
        price: "€2,00",
        originalPrice: "€99,00",
        image: "assets/images/сalendar/lovehoney_calendar.webp",
        description: "Una collezione esclusiva di 12 accessori premium per esplorare nuove dimensioni dell'intimità."
    },
    {
        id: 3,
        name: "LoveBoxxx Sexy Surprise Egg",
        price: "€2,00",
        originalPrice: "€49,90",
        image: "assets/images/egg/egg4.png",
        description: "Un set che ti permette di esplorare i confini della passione e dell’intimità. 14 accessori erotici per coppie, perfetti per ravvivare la relazione e scoprire nuove dimensioni del piacere."
    },
    {
        id: 4,
        name: "The Aphrodisiac Affair",
        price: "€2,00",
        originalPrice: "€127,00",
        image: "assets/images/affair/valentines_day_bundle.webp",
        description: "Salta l’ordinario e vivi una notte di passione, gioco e connessione profonda con il nostro esclusivo bundle Dream Team & Date Night Chocolate."
    },
    {
        id: 5,
        name: "Set Intimità Esclusivo",
        price: "€2,00",
        originalPrice: "€39,95",
        image: "assets/images/intim/main0.webp",
        description: "Un set personalizzato che include altalena per la porta, integratori per la libido, set Durex e dadi Kamasutra."
    }
];

// Inizializzazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
    initializeCarousel();
    initializeQuiz();
    initializeForm();
    initializeProductDetails(); // Add this line
    startCountdown();
    
    // Smooth scrolling per i link interni
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Popup Iniziale
function initializePopup() {
    const popup = document.getElementById('welcomePopup');
    const closeBtn = document.getElementById('closePopup');
    const acceptBtn = document.getElementById('acceptOffer');
    
    // Chiudi popup
    closeBtn.addEventListener('click', closePopup);
    acceptBtn.addEventListener('click', function() {
        closePopup();
        scrollToProducts();
    });
    
    // Chiudi popup cliccando fuori
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });
    
    // Chiudi popup con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display !== 'none') {
            closePopup();
        }
    });
}

function closePopup() {
    const popup = document.getElementById('welcomePopup');
    popup.style.animation = 'popupSlideOut 0.3s ease-in forwards';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 300);
}

// Countdown Timer
function startCountdown() {
    let hours = 23;
    let minutes = 59;
    let seconds = 59;
    
    countdownInterval = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }
            }
        }
        
        // Verifichiamo l'esistenza degli elementi prima dell'aggiornamento
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Carousel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    
    prevBtn.addEventListener('click', () => changeSlide(-1));
    nextBtn.addEventListener('click', () => changeSlide(1));
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });

    // Aggiunta del gestore di clic sui pulsanti di selezione prodotto
    const selectButtons = document.querySelectorAll(".select-product-btn");
    selectButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            const productIndex = parseInt(button.dataset.product);
            selectedProductIndex = productIndex; // Salviamo il prodotto selezionato
            updateSelectedProduct(productIndex);
            document.getElementById("quiz").style.display = "block";
            scrollToQuiz();
        });
    });
    
    // Touch/Swipe support - улучшенная версия
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let swipeHandled = false;
    let wasSwipe = false;
    let swipeTimeout = null;
    let startTime = 0;

    track.addEventListener('touchstart', function(e) {
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        currentY = startY;
        isDragging = true;
        swipeHandled = false;
        wasSwipe = false;
        startTime = Date.now();
        if (swipeTimeout) clearTimeout(swipeTimeout);
        
    }, { passive: true });
    
    track.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        
        // Предотвращаем скролл по вертикали при горизонтальном свайпе
        const diffX = Math.abs(startX - currentX);
        const diffY = Math.abs(startY - currentY);
        
        
        if (diffX > diffY && diffX > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    track.addEventListener('touchend', function(e) {
        if (!isDragging || swipeHandled) return;
        isDragging = false;
        
        const diffX = startX - currentX;
        const diffY = Math.abs(startY - currentY);
        const timeDiff = Date.now() - startTime;
        const threshold = 50;
        const maxTime = 300; // максимальное время для свайпа в мс
        
        // Проверяем что это горизонтальный свайп, а не вертикальный скролл
        if (Math.abs(diffX) > threshold && diffY < 100 && timeDiff < maxTime) {
            if (diffX > 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
            swipeHandled = true;
            wasSwipe = true;
            
            // Увеличиваем время блокировки клика после свайпа
            if (swipeTimeout) clearTimeout(swipeTimeout);
            swipeTimeout = setTimeout(() => { 
                wasSwipe = false; 
            }, 700); // увеличено с 500 до 700 мс
        }
        
        currentX = startX;
        currentY = startY;
    });

    track.addEventListener('mousedown', function(e) {
        if (isTouch) return; // если был touch, не реагировать на mouse
        startX = e.clientX;
        currentX = startX;
        isDragging = true;
        swipeHandled = false;
        track.style.cursor = 'grabbing';
    });
    track.addEventListener('mousemove', function(e) {
        if (!isDragging || isTouch) return;
        currentX = e.clientX;
    });
    track.addEventListener('mouseup', function() {
        if (!isDragging || isTouch || swipeHandled) return;
        isDragging = false;
        track.style.cursor = 'grab';
        const diffX = startX - currentX;
        const threshold = 50;
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
            swipeHandled = true;
        }
        currentX = startX;
    });
    track.addEventListener('mouseleave', function() {
        if (!isDragging || isTouch) return;
        isDragging = false;
        track.style.cursor = 'grab';
        currentX = startX;
    });
    
    // Добавляем обработчик на карточки
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, idx) => {
        card.addEventListener('click', function(e) {
            // Не реагировать на клик по кнопкам внутри карточки
            if (e.target.closest('.details-btn') || e.target.closest('.select-product-btn')) return;
            
            // Предотвращаем открытие модалки после свайпа на мобильных устройствах
            if (wasSwipe && isTouch) {
                wasSwipe = false;
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
            
            showProductDetails(idx);
        });
    });

}

// 1. Исправление бага слайдера (changeSlide):
function changeSlide(direction) {
    const slides = document.querySelectorAll('.product-slide');
    const totalSlides = slides.length;
    let nextSlide = currentSlide + direction;
    if (nextSlide < 0) nextSlide = totalSlides - 1;
    if (nextSlide >= totalSlides) nextSlide = 0;
    currentSlide = nextSlide;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.querySelectorAll('.indicator');
    const slides = document.querySelectorAll('.product-slide');
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
    });
}

// Quiz
function initializeQuiz() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            const question = this.closest('.question');
            const questionNum = question.dataset.question;
            
            // Rimuovi selezione precedente
            question.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Aggiungi selezione corrente
            this.classList.add('selected');
            
            // Salva risposta
            quizAnswers[questionNum] = this.dataset.value;
            
            // Vai alla prossima domanda dopo un breve delay
            setTimeout(() => {
                nextQuestion();
            }, 500);
        });
    });
}

function nextQuestion() {
    if (currentQuestion < 5) {
        // Nascondiamo la domanda corrente
        const currentQuestionEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
        currentQuestionEl.classList.remove('active');
        
        // Passiamo alla domanda successiva
        currentQuestion++;
        
        // Aggiorniamo la variabile globale per l'analisi
        window.currentQuizQuestion = currentQuestion;
        
        setTimeout(() => {
            const nextQuestionEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
            nextQuestionEl.classList.add('active');
            
            // Aggiorniamo la barra di progresso
            updateQuizProgress();
        }, 300);
    } else {
        // Quiz completato, mostriamo il risultato
        showQuizResult();
    }
}
function updateQuizProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    
    const progress = (currentQuestion / 5) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = currentQuestion;
}

function showQuizResult() {
    const currentQuestionEl = document.querySelector(`.question[data-question="5"]`);
    const resultEl = document.getElementById('quizResult');
    
    // Nascondiamo l'ultima domanda
    currentQuestionEl.classList.remove('active');
    
    // Mostriamo il risultato
    setTimeout(() => {
        resultEl.classList.add("active");
        updateQuizProgress();
        
        // Nascondiamo i blocchi non necessari
        document.querySelector('.hero').style.display = 'none';
        document.querySelector('#products').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        document.querySelector('#quiz').style.display = 'none'; // Скрываем весь quiz-container
        
        document.getElementById("order").style.display = "block";
        // Aggiorniamo il prodotto selezionato nel modulo ordine basato sulla scelta dell'utente
        updateSelectedProduct(selectedProductIndex);
        scrollToOrder();
    }, 300);
    
    // Inviamo l'analisi del completamento del quiz
    trackQuizComplete(quizAnswers);
}

function calculateRecommendation() {
    // Logica semplificata per raccomandazione basata sulle risposte
    const age = quizAnswers['1'];
    const looking = quizAnswers['2'];
    const preference = quizAnswers['3'];
    const budget = quizAnswers['4'];
    const purpose = quizAnswers['5'];
    
    // Algoritmo di raccomandazione
    if (looking === 'wellness' || preference === 'natural') {
        return products[0]; // Set Benessere Maschile
    } else if (looking === 'exploration' && budget !== 'budget') {
        return products[1]; // Calendario dell'Intimità
    } else if (looking === 'romance' || purpose === 'surprise') {
        return products[2]; // Set Romantico Premium
    } else if (looking === 'adventure' && budget !== 'luxury') {
        return products[3]; // Altalena Premium
    } else {
        return products[4]; // Integratori per Coppie
    }
}

// Form
function initializeForm() {
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input, select');
    
    // Validazione in tempo reale
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Submit form
    // form.addEventListener('submit', handleFormSubmit);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Rimuovi errori precedenti
    clearFieldError(e);
    
    // Validazione per tipo di campo
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Inserisci un indirizzo email valido';
            }
            break;
        case 'tel':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Inserisci un numero di telefono valido';
            }
            break;
        case 'text':
            if (field.required && value.length < 2) {
                isValid = false;
                errorMessage = 'Questo campo è obbligatorio';
            }
            break;
    }
    
    // Validazione CAP italiano
    if (field.id === 'zipCode') {
        const zipRegex = /^[0-9]{5}$/;
        if (!zipRegex.test(value)) {
            isValid = false;
            errorMessage = 'Inserisci un CAP valido (5 cifre)';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    const errorEl = field.parentNode.querySelector('.field-error');
    
    if (errorEl) {
        errorEl.remove();
    }
    
    field.classList.remove('error');
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.color = 'var(--deep-pink)';
    errorEl.style.fontSize = '0.8rem';
    errorEl.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorEl);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    let isFormValid = true;
    
    // Валидация всех обязательных полей
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Per favore, correggi gli errori nel modulo', 'error');
        return;
    }
    
    // Получаем информацию о выбранном продукте
    const selectedProductImg = document.querySelector('#selectedProduct img');
    const selectedProductTitle = document.querySelector('#selectedProduct h4');
    const productSrc = selectedProductImg ? selectedProductImg.src : '';
    const productName = selectedProductTitle ? selectedProductTitle.textContent : '';
    
    // Определяем ID продукта по изображению
    let productId = 1;
    if (productSrc.includes('lovehoney')) productId = 2;
    else if (productSrc.includes('valentines')) productId = 3;
    else if (productSrc.includes('sex_swing')) productId = 4;
    else if (productSrc.includes('couples_libido')) productId = 5;
    
    // Симуляция отправки заказа
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        showNotification('Ordine inviato con successo! Riceverai una conferma via email.', 'success');
        
        // Inviamo l'analisi dell'ordine
        trackOrder(productId, productName);
        
        // Reset del modulo dopo il successo
        setTimeout(() => {
            form.reset();
            scrollToTop();
        }, 2000);
    }, 2000);
}

// Utility Functions
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToOrder() {
    document.getElementById('order').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateSelectedProduct(index) {
    const product = products[index];
    const selectedProductEl = document.getElementById('selectedProduct');
    
    selectedProductEl.innerHTML = `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="item-details">
                <h4>${product.name}</h4>
                <div class="price-info">
                    <span class="original-price">${product.originalPrice}</span>
                    <span class="current-price">${product.price}</span>
                </div>
            </div>
        </div>
    `;
    
    // Aggiorna totali
    document.getElementById('subtotal').textContent = product.price;
    document.getElementById('total').textContent = product.price;
    
    // Aggiorniamo i campi nascosti del modulo
    document.getElementById('productName').value = product.name;
    document.getElementById('productImage').value = location.origin + '/' +product.image;
    
    // Compiliamo i parametri UTM dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmFields = ['utm_source', 'utm_content', 'utm_term', 'utm_campaign', 'utm_medium', 'uuid', 'fbclid', 'gclid', 'cpc', 'cur'];
    
    utmFields.forEach(field => {
        const value = urlParams.get(field);
        const element = document.getElementById(field);
        if (value && element) {
            element.value = value;
        }
    });
}



function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.src = imageSrc;
    lightbox.classList.add('active');
    
    // Previeni scroll del body
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // Ripristina scroll del body
    document.body.style.overflow = '';
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Stili per la notifica
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: '10001',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Loading State
function showLoadingState() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="loading-spinner"></span>
        Elaborazione in corso...
    `;
    
    // Aggiungi spinner CSS se non esiste
    if (!document.querySelector('#spinner-styles')) {
        const spinnerStyles = document.createElement('style');
        spinnerStyles.id = 'spinner-styles';
        spinnerStyles.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s ease-in-out infinite;
                margin-right: 10px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinnerStyles);
    }
}

function hideLoadingState() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Completa l'Ordine - <span id="finalPrice">€53,99</span>`;
}

// Analytics (simulato)
function sendAnalytics(formData) {
    const analyticsData = {
        event: 'purchase',
        timestamp: new Date().toISOString(),
        product: products[currentSlide],
        customer: {
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            email: formData.get('email'),
            city: formData.get('city'),
            country: formData.get('country')
        },
        quiz_answers: quizAnswers,
        source: 'landing_page'
    };
    
    
    // Simula chiamata al file PHP analytics
    // fetch('analytics.php', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(analyticsData)
    // });
}

// Gestione errori globali
window.addEventListener('error', function(e) {
    showNotification('Si è verificato un errore. Ricarica la pagina e riprova.', 'error');
});

// Performance monitoring

// Gestione visibilità pagina
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pausa animazioni quando la pagina non è visibile
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    } else {
        // Riprendi animazioni quando la pagina torna visibile
        startCountdown();
    }
});

// Aggiungi stili per le animazioni delle notifiche
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes popupSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
        }
    }
    
    .field-error {
        animation: fadeInUp 0.3s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    input.error, select.error {
        border-color: var(--deep-pink) !important;
        box-shadow: 0 0 0 3px rgba(199, 21, 133, 0.2) !important;
    }
`;

document.head.appendChild(notificationStyles);



// Аналитические функции
function sendAnalytics(eventType, data = {}) {
    const analyticsData = {
        type: eventType,
        timestamp: new Date().toISOString(),
        ...data
    };
    
    // Проверяем, что мы не на локальном файле
    if (window.location.protocol !== 'file:') {
        fetch('analytics.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(analyticsData)
        }).catch(error => {});
    }
}

// Отслеживание просмотров страниц
function trackPageView(section) {
    sendAnalytics('page_view', { section: section });
}

// Отслеживание выхода из квиза
function trackQuizExit(questionNumber) {
    sendAnalytics('quiz_exit', { questionNumber: questionNumber });
}

// Отслеживание завершения квиза
function trackQuizComplete(answers) {
    sendAnalytics('quiz_complete', { answers: answers });
}

// Отслеживание заказов
function trackOrder(productId, productName) {
    sendAnalytics('order', { 
        productId: productId, 
        productName: productName 
    });
}

// Отслеживание времени на странице для выявления выходов
let pageStartTime = Date.now();
let currentQuizQuestion = 1;

// Отслеживание выхода со страницы
window.addEventListener('beforeunload', function() {
    const timeOnPage = Date.now() - pageStartTime;
    
    // Если пользователь был в квизе и провел мало времени, считаем это выходом
    if (timeOnPage < 30000 && currentQuizQuestion > 1) { // менее 30 секунд
        trackQuizExit(currentQuizQuestion);
    }
});

// Отслеживание скролла для определения активности
let lastScrollTime = Date.now();
window.addEventListener('scroll', function() {
    lastScrollTime = Date.now();
});

// Инициализация аналитики при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    trackPageView('landing');
});



function scrollToQuiz() {
    document.getElementById('quiz').scrollIntoView({
        behavior: 'smooth'
    });
}

// Дополнительные изображения для каждого продукта
const productImages = {
    0: [ // Viagra Connect Bundle
        "assets/images/viagra/viagra_connect_bundle.webp",
        "assets/images/viagra/via3.png", 
        "assets/images/viagra/via2.avif",
        "assets/images/viagra/via4.webp",
        "assets/images/viagra/via5.webp",
        "assets/images/viagra/via6.webp"
    ],
    1: [ // Lovehoney Calendar
        "assets/images/сalendar/lovehoney_calendar.webp",
        "assets/images/сalendar/lovehoney_indulge_calendar_main.webp",
        "assets/images/сalendar/cal2.png",
        "assets/images/сalendar/cal3.png",
        "assets/images/сalendar/cal4.png",
        "assets/images/сalendar/cal5.png"
    ],  
    2: [ // LoveBoxxx Surprise Egg
        "assets/images/egg/egg1.webp",
        "assets/images/egg/egg3.webp",
        "assets/images/egg/egg2.webp",
        "assets/images/egg/egg4.png"
    ],
    3: [ // Valentine's Day Bundle
        "assets/images/affair/valentines_day_bundle.webp",
        "assets/images/affair/valentines_day_bundle_main.webp",
        "assets/images/affair/valentines_bundle_detail_1.webp",
        "assets/images/affair/valentines_bundle_detail_2.webp",
        "assets/images/affair/val1.webp",
        "assets/images/affair/val2.webp",
        "assets/images/affair/val3.webp",
        "assets/images/affair/val4.webp",
        "assets/images/affair/val5.webp",
        "assets/images/affair/val6.webp",
        "assets/images/affair/val7.webp",
        "assets/images/affair/val8.webp",
        "assets/images/affair/val9.webp",
        "assets/images/affair/val10.webp"
    ],
    4: [ // Set Intimità Esclusivo
        "assets/images/intim/main0.webp",
        "assets/images/intim/main.webp",
        "assets/images/intim/couples_libido_gummies_main.webp",
        "assets/images/intim/in2.webp",
        "assets/images/intim/dado_kamasutra_sex_toys.webp",
        "assets/images/intim/in1.jpg",
        "assets/images/intim/lubr.avif",
        "assets/images/intim/gum1.webp", 
        "assets/images/intim/gum2.webp", 
        "assets/images/intim/gum3.webp"

    ]
};

// Detailed product information
const detailedProducts = [
    {
        id: 0,
        name: "Viagra Connect Bundle",
        originalPrice: "€107,98",
        currentPrice: "€2,00",
        image: "assets/images/viagra/viagra_connect_bundle.webp",
        description: "Un set completo per il benessere maschile che combina Viagra Connect per uomini maggiorenni, preservativi Durex con texture speciali e un lubrificante di alta qualità per incontri sicuri e appaganti.",
        features: [
            "Viagra Connect destinato esclusivamente agli uomini 18+",
            "Preservativi Durex con nervature, punti e lubrificante Performa per ritardare l’orgasmo",
            "Lubrificante a base d’acqua adatto a sesso vaginale, anale e orale",
            "Non adatto alle donne."
        ],
        detailedDescription: "Il kit include 8 compresse da 50 mg di Viagra Connect per uomini che hanno difficoltà a raggiungere o mantenere l’erezione, il lubrificante Durex Play Feel per utilizzo vaginale, anale o orale e i preservativi Durex Ultimate Mutual Climax dotati di nervature, punti e lubrificante Performa che aiutano a prolungare il piacere. Il set è dedicato agli uomini e richiede la consulenza di un medico in caso di condizioni di salute.",
        components: [
            {
                name: "Viagra Connect (8 compresse)",
                description: "8 compresse da 50 mg per uomini 18+ con difficoltà erettile",
                price: "Componente principale"
            },
            {
                name: "Durex Ultimate Mutual Climax Condoms",
                description: "Preservativi con nervature, punti e lubrificante Performa per ritardare l’orgasmo",
                price: "Incluso nel set"
            },
            {
                name: "Durex Play Feel Lubricant",
                description: "Lubrificante a base d’acqua adatto a sesso vaginale, anale o orale",
                price: "Incluso nel set"
            }
        ]
    },
    {
        id: 1,
        name: "Lovehoney Indulge Sex Toy Advent Calendar",
        originalPrice: "€198,00",
        currentPrice: "€2,00",
        image: "assets/images/сalendar/lovehoney_calendar.webp",
        description: "Una collezione esclusiva di 12 accessori premium per esplorare nuove dimensioni dell’intimità. Include stimolatori, vibratori, accessori per bondage leggero e prodotti per la cura personale.",
        features: [
            "12 accessori premium selezionati per il piacere e il benessere",
            "Stimolatore clitorideo e G‑spot con tecnologia Pleasure Air",
            "Vibratori ricaricabili e mini wand con diverse velocità e modalità",
            "Accessori per giochi di coppia, allenamento del pavimento pelvico e prodotti per la cura e l’igiene"
        ],
        detailedDescription: "Il calendario dell’Avvento Indulge contiene 12 accessori studiati per il piacere femminile: stimolatore clitorideo e G‑spot con 10 livelli di suzione e 10 modalità di vibrazione, bullet ricaricabile USB con 3 velocità e 7 pattern, mini wand per massaggi esterni con 3 velocità e 7 pattern, palline Kegel da 54 g in silicone per rafforzare il pavimento pelvico, pinze per capezzoli regolabili in metallo con punte in silicone, dildo sagomato per il punto G, plug anale in metallo con cristallo, beads anali in silicone per principianti, guaina vibrante per dito con anello, mascherina in raso con pizzo per giochi sensoriali, balsamo orgasmico alla menta da applicare esternamente, salviette igienizzanti con aloe e amamelide e gel lubrificante a base d’acqua da 60 ml.",
        components: [
            {
                name: "Indulge Clitoral & G‑Spot Stimulator",
                description: "Stimolatore clitorideo e G‑spot con 10 livelli di suzione e 10 modalità di vibrazione grazie alla tecnologia Pleasure Air",
                price: "Incluso"
            },
            {
                name: "Bullet vibratore ricaricabile",
                description: "Vibratore compatto impermeabile con 3 velocità e 7 pattern, utilizzabile da solo o con altri accessori",
                price: "Incluso"
            },
            {
                name: "Mini wand vibratore",
                description: "Mini wand per massaggi esterni con 3 velocità e 7 modalità, ideale per i viaggi",
                price: "Incluso"
            },
            {
                name: "Palline Kegel",
                description: "Palline da 54 g in silicone per allenare il pavimento pelvico",
                price: "Incluso"
            },
            {
                name: "Pinze per capezzoli",
                description: "Pinze regolabili color oro rosa con punte in silicone viola",
                price: "Incluso"
            },
            {
                name: "Dildo sagomato per punto G",
                description: "Dildo in silicone sagomato per stimolare il punto G, compatibile con bullet",
                price: "Incluso"
            },
            {
                name: "Plug anale con cristallo",
                description: "Plug anale in metallo color oro rosa con cristallo viola, elegante e sicuro",
                price: "Incluso"
            },
            {
                name: "Beads anali",
                description: "Catena di beads in silicone per principianti, utilizzabile con bullet",
                price: "Incluso"
            },
            {
                name: "Guaina vibrante per dito",
                description: "Rivestimento in silicone per il dito con anello di sostegno, compatibile con bullet",
                price: "Incluso"
            },
            {
                name: "Mascherina in raso",
                description: "Mascherina viola e nera in raso con dettagli in pizzo per giochi sensoriali",
                price: "Incluso"
            },
            {
                name: "Balsamo orgasmico alla menta",
                description: "Balsamo in latta color oro rosa da applicare esternamente per intensificare le sensazioni",
                price: "Incluso"
            },
            {
                name: "Salviette igienizzanti",
                description: "Salviette con aloe e amamelide per la pulizia dei sex toys",
                price: "Incluso"
            },
            {
                name: "Gel lubrificante a base d’acqua (60 ml)",
                description: "Gel lubrificante delicato a base d’acqua compatibile con tutti i prodotti",
                price: "Incluso"
            }
        ]
    },
    {
        id: 2,
        name: "LoveBoxxx Sexy Surprise Egg",
        originalPrice: "€252,00",
        currentPrice: "€2,00",
        image: "assets/images/egg/egg4.png",
        description: "Un set che ti permette di esplorare i confini della passione e dell’intimità. 14 accessori erotici per coppie, perfetti per ravvivare la relazione e scoprire nuove dimensioni del piacere.",
        features: [
            "Set di ausili erotici ideali per le coppie",
            "Selezione variegata di prodotti per l'intimità",
            "Adatto a principianti e amanti esperti",
            "Facile da usare"
        ],
        detailedDescription: "Sorprendi la tua dolce metà con 14 giocattoli e accessori erotici: vibratore multivelocità, biancheria sexy, ausili per bondage leggero e strumenti per la cura del corpo. Materiali: ABS, PVC, TPE, metallo, poliestere. Dimensioni confezione: 25,5×17×17 cm. Usa con gel a base d'acqua e pulisci dopo ogni utilizzo.",
        components: [
            {
                name: "5× Ausili Erotici",
                description: "Incluso vibratore multivelocità e altri stimolatori per diversi livelli di piacere.",
                price: "Incluso"
            },
            {
                name: "1× Biancheria Intima Sexy",
                description: "Mutandine con cavallo aperto per giochi sensuali.",
                price: "Incluso"
            },
            {
                name: "4× Ausili per Bondage Leggero",
                description: "Manette, maschera per occhi e altri accessori per esplorare il bondage in modo sicuro.",
                price: "Incluso"
            },
            {
                name: "4× Strumenti per la Cura del Corpo",
                description: "Accessori divertenti per massaggi e giochi di coppia.",
                price: "Incluso"
            }
        ]
    },
    {
        id: 3,
        name: "The Aphrodisiac Affair",
        originalPrice: "€127,00",
        currentPrice: "€2,00",
        image: "assets/images/affair/valentines_day_bundle.webp",
        description: "Bundle esclusivo che unisce il set di vibratori Dream Team con deliziosi cioccolatini afrodisiaci, un mazzo di carte Verità o Sfida e una playlist sensuale.",
        features: [
            "Dream Team: 4 vibratori (anello fallico regolabile, panty vibrator, plug anale vibrante e disco stick) controllati da telecomando con 8 modalità",
            "Materiali sicuri per il corpo, resistenti agli spruzzi e ricaricabili tramite USB",
            "Date Night Chocolate: tavoletta di cioccolato fondente 60% con fragole e cayenna infusa con maca, ginseng e damiana, con carte Verità o Sfida",
            "Include gioco Twister, custodia, cavo USB e link a una playlist sensuale"
        ],
        detailedDescription: "Il set Dream Team comprende quattro giocattoli telecomandati progettati per giocare in coppia: un anello fallico regolabile che migliora la circolazione e stimola il clitoride, un vibratore per slip con 8 modalità di vibrazione, un plug anale vibrante e un disco stick multiuso. I dispositivi sono realizzati in silicone sicuro per il corpo, resistenti agli spruzzi, dotati di motore intercambiabile e si ricaricano rapidamente tramite USB; la confezione include telecomando wireless, ruota della fortuna, custodia, manuale, cavo USB e un gioco Twister. Il Date Night Chocolate è una tavoletta di cioccolato fondente al 60% con fragole liofilizzate e cayenna, arricchito con erbe afrodisiache come maca, panax ginseng e damiana; la confezione contiene anche carte Verità o Sfida e un link a una playlist musicale per creare atmosfera. Questo bundle rafforza l’intimità e rende speciali serate romantiche e anniversari.",
        components: [
            {
                name: "Dream Team Set",
                description: "Telecomando, ruota della fortuna, 4 vibratori (anello fallico regolabile, panty vibrator, plug anale vibrante e disco stick), motore intercambiabile, custodia, gioco Twister e cavo USB",
                price: "Incluso nel set"
            },
            {
                name: "Date Night Chocolate",
                description: "Tavoletta di cioccolato fondente 60% con fragole e cayenna infusa con maca, ginseng e damiana; include carte Verità o Sfida e link a playlist",
                price: "Incluso nel set"
            },
            {
                name: "Gioco ‘Verità o Sfida’",
                description: "Mazzo di carte con sfide piccanti per coppie",
                price: "Incluso nel set"
            },
            {
                name: "Playlist sensuale",
                description: "Link a playlist musicale per creare l’atmosfera durante la serata",
                price: "Incluso nel set"
            }
        ]
    },
    {
        id: 4,
        name: "Set Intimità Esclusivo",
        originalPrice: "€144,00",
        currentPrice: "€2,00",
        image: "assets/images/intim/main0.webp",
        description: "Set completo per la coppia che combina una altalena da porta, integratori naturali per la libido, un set Durex per esplorare nuove sensazioni e un dado Kamasutra per giocare.",
        features: [
            "Altalena da porta con capacità di 150 kg e cinghie regolabili",
            "Integratori a base di ingredienti naturali per aumentare la libido di entrambi",
            "Set Durex Deep & Deeper con plug anali e lubrificante a base d’acqua",
            "Dado a 6 facce con posizioni del Kamasutra per giochi erotici"
        ],
        detailedDescription: "Questo set personalizzato offre tutto il necessario per ravvivare l’intimità: un’altalena da porta realizzata in pelle sintetica e poliestere con capacità massima di 150 kg; si aggancia facilmente sopra la porta grazie a cinghie regolabili ed è adatta a uomini e donne. La confezione comprende anche integratori libidinali per lui e lei sotto forma di gummies a base di ingredienti naturali come L‑citrullina, L‑arginina, complesso S7 e botanici adattogeni; le caramelle hanno gusto al frutto della passione, sono vegane, a basso contenuto di zuccheri e forniscono una fornitura per 32 giorni. Il Coffret Durex Deep & Deeper abbina un set di plug anali di diverse dimensioni e il lubrificante a base d’acqua Durex Play Feel da 100 ml per esplorare nuove sensazioni con la qualità e la discrezione di Durex. Infine, il dado Kamasutra a sei facce propone diverse posizioni sessuali da seguire per aggiungere un elemento di gioco all’intimità.",
        components: [
            {
                name: "Altalena da porta",
                description: "Altalena intima da fissare alla porta in pelle sintetica e poliestere con cinghie regolabili; capacità massima 150 kg",
                price: "Incluso"
            },
            {
                name: "Couples Libido Gummies",
                description: "Gummies per lui e lei con ingredienti come L‑citrullina, L‑arginina, S7 e botanici adattogeni; gusto frutto della passione; vegane e a basso contenuto di zuccheri; fornitura per 32 giorni",
                price: "Incluso"
            },
            {
                name: "Coffret Durex Deep & Deeper",
                description: "Set con plug anali di diverse dimensioni e lubrificante a base d’acqua Durex Play Feel da 100 ml",
                price: "Incluso"
            },
            {
                name: "Dado Kamasutra",
                description: "Dado a sei facce con posizioni del Kamasutra per giochi erotici",
                price: "Incluso"
            }
        ]
    }
];

// Initialize product details functionality
function initializeProductDetails() {
    const detailsButtons = document.querySelectorAll('.details-btn');
    const modal = document.getElementById('productDetailsModal');
    const closeBtn = document.getElementById('closeModal');
    
    detailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.dataset.product);
            showProductDetails(productId);
        });
    });
    
    closeBtn.addEventListener('click', closeProductDetails);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeProductDetails();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeProductDetails();
        }
    });
}

function showProductDetails(productId) {
    const product = detailedProducts[productId];
    if (!product) return;
    
    const modal = document.getElementById('productDetailsModal');
    const modalImage = document.getElementById('modalImage');
    const modalProductName = document.getElementById('modalProductName');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalFeatures = document.getElementById('modalFeatures');
    const modalComponents = document.getElementById('modalComponents');
    const modalSelectBtn = document.getElementById('modalSelectBtn');
    
    // Populate modal content
    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalProductName.textContent = product.name;
    modalOriginalPrice.textContent = product.originalPrice;
    modalCurrentPrice.textContent = product.currentPrice;
    modalDescription.innerHTML = `<p>${product.description}</p><p><strong>Dettagli aggiuntivi:</strong> ${product.detailedDescription}</p>`;
    
    // Features
    modalFeatures.innerHTML = `
        <h4>Caratteristiche principali:</h4>
        ${product.features.map(feature => `<div class="feature">${feature}</div>`).join('')}
    `;
    
    // Components
    if (product.components && product.components.length > 0) {
        modalComponents.innerHTML = `
            <h4>Componenti del set:</h4>
            ${product.components.map(component => `
                <div class="component-item">
                    <h5>${component.name}</h5>
                    <p>${component.description}</p>
                    <div class="component-price">${component.price}</div>
                </div>
            `).join('')}
        `;
    } else {
        modalComponents.innerHTML = '';
    }
    
    // Галерея изображений
    const modalImageGallery = document.getElementById('modalImageGallery');
    const images = productImages[productId] || [];
    if (images.length > 0) {
        modalImageGallery.innerHTML = images.map((imageSrc, index) => `
            <img src="${imageSrc}" alt="${product.name} - Immagine ${index + 1}" 
                 class="modal-gallery-image ${index === 0 ? 'active' : ''}" 
                 loading="lazy" onclick="changeMainImage('${imageSrc}', ${index})">
        `).join('');
    } else {
        modalImageGallery.innerHTML = '';
    }
    
    // Set up select button
    modalSelectBtn.onclick = function() {
        selectedProductIndex = productId;
        updateSelectedProduct(productId);
        closeProductDetails();
        document.getElementById("quiz").style.display = "block";
        scrollToQuiz();
    };
    
    // Добавляем быстрые действия
    let modalActions = document.querySelector('.modal-actions');
    if (modalActions) {
        // Удаляем старые стрелки если есть
        if (document.getElementById('modalPrevBtn')) modalActions.removeChild(document.getElementById('modalPrevBtn'));
        if (document.getElementById('modalNextBtn')) modalActions.removeChild(document.getElementById('modalNextBtn'));
        // Левая стрелка
        let prevBtn = document.createElement('button');
        prevBtn.id = 'modalPrevBtn';
        prevBtn.className = 'modal-nav-btn';
        prevBtn.innerHTML = '&lt;';
        prevBtn.title = 'Precedente';
        prevBtn.onclick = function(e) {
            e.stopPropagation();
            let prev = (productId - 1 + detailedProducts.length) % detailedProducts.length;
            showProductDetails(prev);
            // Автоматический скролл вверх модального окна
            setTimeout(() => {
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.scrollTop = 0;
                }
            }, 100);
        };
        // Правая стрелка
        let nextBtn = document.createElement('button');
        nextBtn.id = 'modalNextBtn';
        nextBtn.className = 'modal-nav-btn';
        nextBtn.innerHTML = '&gt;';
        nextBtn.title = 'Successivo';
        nextBtn.onclick = function(e) {
            e.stopPropagation();
            let next = (productId + 1) % detailedProducts.length;
            showProductDetails(next);
            // Автоматический скролл вверх модального окна
            setTimeout(() => {
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.scrollTop = 0;
                }
            }, 100);
        };
        modalActions.prepend(prevBtn);
        modalActions.appendChild(nextBtn);
    }
    
    // Фокус на модалке для мобильных
    setTimeout(() => {
        document.getElementById('productDetailsModal').focus();
    }, 100);
    
    // Show modal
    modal.style.display = 'flex';
}

function closeProductDetails() {
    const modal = document.getElementById('productDetailsModal');
    modal.style.animation = 'modalSlideOut 0.3s ease-in forwards';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = '';
    }, 300);
}

// Функция для смены главного изображения в галерее
function changeMainImage(imageSrc, index) {
    const modalImage = document.getElementById('modalImage');
    const galleryImages = document.querySelectorAll('.modal-gallery-image');
    
    // Обновляем главное изображение
    modalImage.src = imageSrc;
    
    // Обновляем активное состояние в галерее
    galleryImages.forEach((img, i) => {
        if (i === index) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
}

// Add CSS animation for modal close
const style = document.createElement('style');
style.textContent = `
    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

// Удаляем дублирующий обработчик DOMContentLoaded

