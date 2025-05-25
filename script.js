// ====== Global Variables & DOM Elements ======
let words = []; // 단어 데이터를 담을 배열
let currentIndex = 0; // 현재 표시되는 단어의 인덱스
let isGeneralMode = true; // 현재 일반 모드인지 즐겨찾기 모드인지

const foreignWordElem = document.getElementById('foreignWord');
const meaningElem = document.getElementById('meaning');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const statusMessageElem = document.getElementById('statusMessage');
const currentWordIndexElem = document.getElementById('currentWordIndex');
const totalWordsElem = document.getElementById('totalWords');
const favoriteIcon = document.getElementById('favoriteIcon'); // 즐겨찾기 아이콘
const favoriteBtn = document.getElementById('favoriteBtn'); // 즐겨찾기 버튼
const generalModeBtn = document.getElementById('generalModeBtn');
const favoriteModeBtn = document.getElementById('favoriteModeBtn');
const speakBtn = document.getElementById('speakBtn'); // 발음 듣기 버튼

// 새로운 DOM 요소들
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');

const newForeignWordInput = document.getElementById('newForeignWord');
const newMeaningInput = document.getElementById('newMeaning');
const addWordBtn = document.getElementById('addWordBtn');

const sectionAddWord = document.querySelector('.section-add-word');
const sectionEditWord = document.querySelector('.section-edit-word');
const editForeignWordInput = document.getElementById('editForeignWord');
const editMeaningInput = document.getElementById('editMeaning');
const saveEditBtn = document.getElementById('saveEditBtn');
// 이전 오타 수정됨: = document = document.getElementById  -> = document.getElementById
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editHr = document.querySelector('hr.edit-hr'); // 수정 모드 전용 hr

// 언어 표시 모드 관련 DOM 요소
const foreignOverlay = document.getElementById('foreignOverlay');
const meaningOverlay = document.getElementById('meaningOverlay');
const displayModeRadios = document.querySelectorAll('input[name="displayMode"]');


// ====== Functions ======

/**
 * localStorage에서 단어 데이터를 로드합니다.
 * @returns {Array} 로드된 단어 배열 또는 빈 배열
 */
function loadWords() {
    const storedWords = localStorage.getItem('foreignWords');
    // 저장된 데이터가 없으면 샘플 데이터를 사용
    if (storedWords) {
        return JSON.parse(storedWords);
    } else {
        // 샘플 데이터
        return [
            { foreign: 'Apple', meaning: '사과', isFavorite: false },
            { foreign: '안녕하세요', meaning: 'Hello', isFavorite: false },
            { foreign: 'Book', meaning: '책', isFavorite: false },
            { foreign: '고맙습니다', meaning: 'Thank you', isFavorite: false },
            { foreign: 'Computer', meaning: '컴퓨터', isFavorite: false },
            { foreign: '죄송합니다', meaning: 'Sorry', isFavorite: false },
            { foreign: 'Water', meaning: '물', isFavorite: false },
            { foreign: '사랑합니다', meaning: 'I love you', isFavorite: false },
            { foreign: 'Friend', meaning: '친구', isFavorite: false },
            { foreign: '화장실이 어디예요?', meaning: 'Where is the restroom?', isFavorite: false }
        ];
    }
}

/**
 * localStorage에 단어 데이터를 저장합니다.
 */
function saveWords() {
    localStorage.setItem('foreignWords', JSON.stringify(words));
    console.log('Words saved to localStorage.');
}

/**
 * 현재 모드(일반/즐겨찾기)에 따라 표시할 단어 리스트를 가져옵니다.
 * @returns {Array} 현재 모드에 해당하는 단어 배열
 */
function getWordsForCurrentMode() {
    return isGeneralMode ? words : words.filter(word => word.isFavorite);
}

/**
 * 현재 인덱스의 단어를 화면에 표시하고 상태 메시지를 업데이트합니다.
 */
function displayWord() {
    const currentWords = getWordsForCurrentMode();
    console.log('displayWord called. Mode:', isGeneralMode ? 'General' : 'Favorite', 'Current index (before adjustment):', currentIndex, 'Total words in mode:', currentWords.length);

    if (currentWords.length === 0) {
        foreignWordElem.textContent = '단어가 없습니다.';
        meaningElem.textContent = '새로운 단어를 추가하거나 즐겨찾기를 확인하세요.';
        statusMessageElem.textContent = '';
        currentWordIndexElem.textContent = '0';
        totalWordsElem.textContent = '0';
        favoriteIcon.src = 'https://img.icons8.com/ios-glyphs/24/000000/star--v1.png'; // 기본 별
        // 단어가 없으면 수정/삭제/발음 버튼 비활성화
        editBtn.disabled = true;
        deleteBtn.disabled = true;
        speakBtn.disabled = true;
        favoriteBtn.disabled = true;
        // 단어가 없으면 오버레이를 제거하여 "단어가 없습니다" 메시지가 보이도록 함
        foreignOverlay.classList.add('hidden');
        meaningOverlay.classList.add('hidden');
        console.log('No words in current mode. Overlays hidden (text visible).');
        return;
    }

    // 단어가 있을 때 버튼 활성화
    editBtn.disabled = false;
    deleteBtn.disabled = false;
    speakBtn.disabled = false;
    favoriteBtn.disabled = false;

    // 인덱스 유효성 검사 및 조정
    if (currentIndex < 0) {
        currentIndex = 0;
    }
    if (currentIndex >= currentWords.length) {
        currentIndex = currentWords.length - 1;
    }
    console.log('Current index (after adjustment):', currentIndex);

    const currentWord = currentWords[currentIndex];
    foreignWordElem.textContent = currentWord.foreign;
    meaningElem.textContent = currentWord.meaning;

    // 즐겨찾기 아이콘 업데이트
    updateFavoriteIcon(currentWord.isFavorite);

    // 상태 메시지 업데이트
    statusMessageElem.textContent = ''; // 일단 지움
    if (currentIndex === 0 && currentWords.length > 0) {
        statusMessageElem.textContent = '자료의 처음입니다.';
    }
    if (currentIndex === currentWords.length - 1 && currentWords.length > 0) {
        statusMessageElem.textContent = '자료의 마지막입니다.';
    }

    // 단어 카운트 업데이트
    currentWordIndexElem.textContent = currentIndex + 1;
    totalWordsElem.textContent = currentWords.length;

    // 현재 인덱스 저장
    saveCurrentIndex();

    // displayWord 함수 내부에서 toggleDisplayMode를 호출하면,
    // 단어가 바뀔 때마다 오버레이가 기본값(가려진 상태)으로 돌아갑니다.
    // 이는 '클릭하여 보기' 기능의 의도된 동작입니다.
    toggleDisplayMode();
    console.log('After displayWord, current foreign:', foreignWordElem.textContent, 'meaning:', meaningElem.textContent);
}

/**
 * 현재 모드의 마지막 인덱스를 localStorage에 저장합니다.
 */
function saveCurrentIndex() {
    if (isGeneralMode) {
        localStorage.setItem('generalModeIndex', currentIndex);
    } else {
        localStorage.setItem('favoriteModeIndex', currentIndex);
    }
    console.log(`Current index (${isGeneralMode ? 'general' : 'favorite'}) saved: ${currentIndex}`);
}

/**
 * localStorage에서 현재 모드의 마지막 인덱스를 로드합니다.
 * @returns {number} 로드된 인덱스 또는 0
 */
function loadCurrentIndex() {
    const storedIndex = isGeneralMode ?
        localStorage.getItem('generalModeIndex') :
        localStorage.getItem('favoriteModeIndex');
    return storedIndex ? parseInt(storedIndex, 10) : 0;
}


/**
 * 즐겨찾기 아이콘 상태를 업데이트합니다.
 * @param {boolean} isFavorite - 현재 단어가 즐겨찾기인지 여부
 */
function updateFavoriteIcon(isFavorite) {
    if (isFavorite) {
        favoriteIcon.src = 'https://img.icons8.com/ios-filled/24/FAB005/star--v1.png'; // 채워진 노란색 별
        favoriteIcon.alt = '즐겨찾기 해제';
    } else {
        favoriteIcon.src = 'https://img.icons8.com/ios-glyphs/24/000000/star--v1.png'; // 비워진 검은색 별
        favoriteIcon.alt = '즐겨찾기 추가';
    }
}

/**
 * 즐겨찾기 상태를 토글합니다.
 */
function toggleFavorite() {
    const currentWordsInView = getWordsForCurrentMode();
    if (currentWordsInView.length === 0) return;

    const currentWord = currentWordsInView[currentIndex];
    // 전체 words 배열에서 현재 단어의 foreign, meaning이 일치하는 단어를 찾아 업데이트
    // 주의: 실제 앱에서는 단어에 고유 ID를 부여하여 더 안전하게 찾을 수 있습니다.
    const originalWordIndex = words.findIndex(word =>
        word.foreign === currentWord.foreign && word.meaning === currentWord.meaning
    );

    if (originalWordIndex !== -1) {
        words[originalWordIndex].isFavorite = !words[originalWordIndex].isFavorite;
        saveWords(); // 변경 사항을 localStorage에 저장

        // 아이콘 업데이트
        updateFavoriteIcon(words[originalWordIndex].isFavorite);

        // 만약 즐겨찾기 모드에 있는데 현재 단어가 즐겨찾기 해제되면
        // 해당 단어는 더 이상 즐겨찾기 리스트에 없으므로 인덱스를 조정하거나, 리스트가 비면 처리
        if (!isGeneralMode && !words[originalWordIndex].isFavorite) {
            // 현재 인덱스가 새롭게 필터링된 리스트의 길이를 초과하지 않도록 조정
            if (currentIndex >= getWordsForCurrentMode().length && currentIndex > 0) {
                currentIndex--;
            }
            if (getWordsForCurrentMode().length === 0) { // 모든 즐겨찾기 단어가 사라진 경우
                currentIndex = 0;
            }
            displayWord(); // 즐겨찾기 리스트가 변경되었으므로 다시 표시
        }
    }
}


/**
 * 모드를 변경하고 데이터를 다시 로드하여 표시합니다.
 * @param {boolean} generalMode - 일반 모드 여부 (true: 일반, false: 즐겨찾기)
 */
function changeMode(generalMode) {
    isGeneralMode = generalMode;
    // 마지막 사용 모드 저장
    localStorage.setItem('lastAppMode', isGeneralMode ? 'general' : 'favorite');
    console.log(`Mode changed to: ${isGeneralMode ? 'General' : 'Favorite'}`);

    // 현재 모드의 인덱스를 로드
    currentIndex = loadCurrentIndex();

    // 버튼 활성화 상태 변경
    generalModeBtn.classList.toggle('active', isGeneralMode);
    favoriteModeBtn.classList.toggle('active', !isGeneralMode);

    displayWord();
}

/**
 * 발음 듣기 기능 (Web Speech API)
 */
function speakCurrentWord() {
    const currentWords = getWordsForCurrentMode();
    if (currentWords.length === 0) {
        alert('발음할 단어가 없습니다.');
        return;
    }

    const textToSpeak = currentWords[currentIndex].foreign;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // TODO: 단어에 따라 언어 설정
    // 현재는 예시로 영어로 설정합니다. 실제 앱에서는 단어의 언어 정보를 추가하거나
    // 사용자가 언어를 선택하도록 할 수 있습니다.
    utterance.lang = 'en-US'; // 기본값으로 영어 설정. 필요에 따라 변경 (예: 'ko-KR', 'ja-JP', 'zh-CN' 등)

    // 옵션 설정 (선택 사항)
    utterance.pitch = 1; // 음의 높이 (0 to 2)
    utterance.rate = 1;  // 말하는 속도 (0.1 to 10)

    window.speechSynthesis.speak(utterance);
}

/**
 * 새로운 단어를 추가합니다.
 */
function addWord() {
    const foreign = newForeignWordInput.value.trim();
    const meaning = newMeaningInput.value.trim();

    if (foreign && meaning) {
        words.push({ foreign, meaning, isFavorite: false });
        saveWords(); // localStorage에 저장

        // 새로 추가된 단어를 보기 위해 일반 모드로 전환하고 마지막 단어로 이동
        isGeneralMode = true; // 일반 모드로 강제 변경
        generalModeBtn.classList.add('active');
        favoriteModeBtn.classList.remove('active');
        currentIndex = words.length - 1; // 마지막 단어로 이동

        displayWord(); // 화면 업데이트

        // 입력 필드 초기화
        newForeignWordInput.value = '';
        newMeaningInput.value = '';
        alert('단어가 추가되었습니다!');
    } else {
        alert('외국어 단어와 의미를 모두 입력해주세요.');
    }
}

/**
 * 현재 단어를 삭제합니다.
 */
function deleteWord() {
    const currentWordsInView = getWordsForCurrentMode();
    if (currentWordsInView.length === 0) {
        alert('삭제할 단어가 없습니다.');
        return;
    }

    if (!confirm('정말로 이 단어를 삭제하시겠습니까?\n\n' +
        currentWordsInView[currentIndex].foreign + ' - ' + currentWordsInView[currentIndex].meaning)) {
        return; // 사용자가 취소함
    }

    // 현재 보고 있는 단어의 원본 인덱스를 찾아서 삭제
    const currentWordToDelete = currentWordsInView[currentIndex];
    const originalWordIndex = words.findIndex(word =>
        word.foreign === currentWordToDelete.foreign && word.meaning === currentWordToDelete.meaning
    );

    if (originalWordIndex !== -1) {
        words.splice(originalWordIndex, 1); // 원본 배열에서 단어 제거
        saveWords(); // localStorage에 저장

        // 삭제 후 인덱스 조정: 만약 마지막 단어를 삭제했다면 이전 단어로, 아니면 그대로
        if (currentIndex >= getWordsForCurrentMode().length && currentIndex > 0) {
            currentIndex--;
        }
        if (getWordsForCurrentMode().length === 0) { // 모든 단어가 삭제된 경우
            currentIndex = 0;
        }
        displayWord(); // 화면 업데이트
        alert('단어가 삭제되었습니다.');
    }
}

/**
 * 단어 수정 모드로 진입합니다.
 */
function startEdit() {
    const currentWordsInView = getWordsForCurrentMode();
    if (currentWordsInView.length === 0) {
        alert('수정할 단어가 없습니다.');
        return;
    }

    const currentWord = currentWordsInView[currentIndex];
    editForeignWordInput.value = currentWord.foreign;
    editMeaningInput.value = currentWord.meaning;

    // 수정 섹션을 보여주고 다른 섹션 숨기기
    sectionEditWord.style.display = 'block';
    editHr.style.display = 'block';
    sectionAddWord.style.display = 'none';
    document.querySelector('.display-mode-selection').style.display = 'none'; // 모드 선택 숨기기
    // document.querySelector('.section-data-management').style.display = 'none'; // 데이터 관리 섹션도 필요하다면 숨길 수 있음
}

/**
 * 수정된 단어를 저장합니다.
 */
function saveEdit() {
    const currentWordsInView = getWordsForCurrentMode();
    if (currentWordsInView.length === 0) return;

    const editedForeign = editForeignWordInput.value.trim();
    const editedMeaning = editMeaningInput.value.trim();

    if (editedForeign && editedMeaning) {
        const currentWord = currentWordsInView[currentIndex];
        // 원본 words 배열에서 해당 단어를 찾아 업데이트
        const originalWordIndex = words.findIndex(word =>
            word.foreign === currentWord.foreign && word.meaning === currentWord.meaning
        );

        if (originalWordIndex !== -1) {
            words[originalWordIndex].foreign = editedForeign;
            words[originalWordIndex].meaning = editedMeaning;
            saveWords(); // localStorage에 저장

            cancelEdit(); // 수정 모드 종료
            displayWord(); // 화면 업데이트
            alert('단어가 수정되었습니다!');
        }
    } else {
        alert('외국어 단어와 의미를 모두 입력해주세요.');
    }
}

/**
 * 단어 수정 모드를 취소합니다.
 */
function cancelEdit() {
    // 수정 섹션을 숨기고 다른 섹션 다시 보여주기
    sectionEditWord.style.display = 'none';
    editHr.style.display = 'none';
    sectionAddWord.style.display = 'block';
    document.querySelector('.display-mode-selection').style.display = 'flex'; // 모드 선택 다시 보여주기
    // document.querySelector('.section-data-management').style.display = 'block';
}

/**
 * 언어 표시 모드에 따라 오버레이를 토글하고 localStorage에 저장합니다.
 */
function toggleDisplayMode() {
    // 현재 선택된 라디오 버튼의 값을 가져옴, 없으면 'AB'가 기본값
    const selectedMode = document.querySelector('input[name="displayMode"]:checked')?.value || 'AB';
    console.log('toggleDisplayMode called. Selected mode:', selectedMode);

    // 선택된 모드를 localStorage에 저장
    localStorage.setItem('displayMode', selectedMode);

    // 우선 두 오버레이 모두 숨겨 텍스트가 보이게 합니다. (클릭하여 보기가 아닌 기본 상태)
    foreignOverlay.classList.add('hidden');
    meaningOverlay.classList.add('hidden');

    // 선택된 모드에 따라 특정 오버레이를 다시 보이게 하여 텍스트를 가립니다.
    if (selectedMode === 'AB') { // A (외국어) -> B (의미) 학습: 의미 가림
        meaningOverlay.classList.remove('hidden'); // 의미(B) 오버레이를 보이게 하여 가림
        console.log('Mode AB selected: Meaning overlay shown.');
    } else if (selectedMode === 'BA') { // B (의미) -> A (외국어) 학습: 외국어 가림
        foreignOverlay.classList.remove('hidden'); // 외국어(A) 오버레이를 보이게 하여 가림
        console.log('Mode BA selected: Foreign overlay shown.');
    }
}

/**
 * 오버레이 클릭 시 일시적으로 숨김 처리
 * @param {HTMLElement} overlayElement - 클릭된 오버레이 요소
 */
function hideOverlayTemporarily(overlayElement) {
    console.log('Overlay clicked:', overlayElement.id);
    overlayElement.classList.add('hidden'); // 오버레이를 숨김 (텍스트를 보이게 함)
}


// ====== Event Listeners ======

prevBtn.addEventListener('click', () => {
    const currentWords = getWordsForCurrentMode();
    if (currentIndex > 0) {
        currentIndex--;
        displayWord();
    } else {
        statusMessageElem.textContent = '자료의 처음입니다.';
    }
});

nextBtn.addEventListener('click', () => {
    const currentWords = getWordsForCurrentMode();
    if (currentWords.length === 0) {
        statusMessageElem.textContent = '단어가 없습니다.';
        return;
    }
    if (currentIndex < currentWords.length - 1) {
        currentIndex++;
        displayWord();
    } else {
        statusMessageElem.textContent = '자료의 마지막입니다.';
    }
});

favoriteBtn.addEventListener('click', toggleFavorite);

generalModeBtn.addEventListener('click', () => changeMode(true));
favoriteModeBtn.addEventListener('click', () => changeMode(false));

speakBtn.addEventListener('click', speakCurrentWord);

// 단어 추가 이벤트 리스너
addWordBtn.addEventListener('click', addWord);

// 단어 수정/삭제 이벤트 리스너
editBtn.addEventListener('click', startEdit);
deleteBtn.addEventListener('click', deleteWord);
saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', cancelEdit);

// 오버레이 클릭 이벤트 리스너
foreignOverlay.addEventListener('click', () => hideOverlayTemporarily(foreignOverlay));
meaningOverlay.addEventListener('click', () => hideOverlayTemporarily(meaningOverlay));

// 언어 표시 모드 라디오 버튼 변경 이벤트 리스너
displayModeRadios.forEach(radio => {
    radio.addEventListener('change', toggleDisplayMode);
});


// ====== Initialization ======
// 앱 로드 시 실행
window.addEventListener('load', () => {
    words = loadWords(); // localStorage에서 단어 로드 (없으면 샘플 사용)

    // 마지막 사용 모드 (일반/즐겨찾기) 로드
    const lastAppMode = localStorage.getItem('lastAppMode');
    if (lastAppMode === 'favorite') {
        isGeneralMode = false;
    } else {
        isGeneralMode = true; // 기본값은 일반 모드
    }
    changeMode(isGeneralMode); // 로드된 모드에 따라 UI 업데이트 및 첫 단어 표시

    // 언어 표시 모드 (AB/BA) 로드 및 적용
    const savedDisplayMode = localStorage.getItem('displayMode');
    console.log(`[INIT] On load, localStorage 'displayMode' is: "${savedDisplayMode}"`); // 추가 로그

    // 모든 라디오 버튼을 먼저 unchecked 상태로 만듭니다. (안전 장치)
    displayModeRadios.forEach(radio => {
        radio.checked = false;
    });

    if (savedDisplayMode) {
        // 저장된 값에 해당하는 라디오 버튼을 찾아서 checked 상태로 만듭니다.
        const targetRadio = document.getElementById(`mode${savedDisplayMode}`);
        if (targetRadio) {
            targetRadio.checked = true;
            console.log(`[INIT] Set radio button for mode: ${savedDisplayMode}. Current checked state: ${targetRadio.checked}`); // 추가 로그
        } else {
            console.warn(`[INIT] Saved display mode "${savedDisplayMode}" not found, falling back to default.`);
            // 저장된 모드가 유효하지 않으면 HTML에 기본값으로 'checked'된 라디오 버튼을 찾아서 설정
            const defaultCheckedRadio = document.querySelector('input[name="displayMode"][checked]');
            if (defaultCheckedRadio) {
                defaultCheckedRadio.checked = true;
                localStorage.setItem('displayMode', defaultCheckedRadio.value); // localStorage도 업데이트
                console.log(`[INIT] Fallback to HTML default: ${defaultCheckedRadio.value} and updated localStorage.`);
            }
        }
    } else {
        // 저장된 모드가 없으면 HTML에 기본값으로 'checked'된 라디오 버튼을 찾아서 localStorage에 저장
        console.log('[INIT] No display mode saved in localStorage, checking current HTML checked status.');
        const defaultCheckedRadio = document.querySelector('input[name="displayMode"][checked]');
        if (defaultCheckedRadio) {
            localStorage.setItem('displayMode', defaultCheckedRadio.value); // 현재 기본값을 localStorage에 저장
            console.log(`[INIT] Default display mode "${defaultCheckedRadio.value}" saved to localStorage.`);
        }
    }
    // 최종적으로 현재 라디오 버튼 상태에 맞게 오버레이를 적용합니다.
    toggleDisplayMode();
    console.log('[INIT] Final checked radio button value after load:', document.querySelector('input[name="displayMode"]:checked')?.value); // 추가 로그
});

// DOMContentLoaded는 script가 body 끝에 있으므로 window.load 이후에 실행될 필요 없음
// document.addEventListener('DOMContentLoaded', () => { /* ... */ });