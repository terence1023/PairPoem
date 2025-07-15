
// 诗词数据库 - 包含常见诗句（实际应用中可以从API获取或扩展更大的数据库）
// const poemDatabase = [
//     "春江潮水连海平海上明月共潮生",
//     "春江花朝秋月夜往往取酒還獨傾",
//     "江畔何人初見月江月何年初照人",
//     "海上生明月天涯共此時",
// ];

// const poemDatabase = [];
// const response = await fetch('tang_300-song_300.json');
// const data = await response.json();
// const response = fetch('tang_300-song_300.json');
// const data = response.json();
// // const poemDatabase = data.poems; // 将 JSON 中的 poems 数组赋值给 poemDatabase
// const poemDatabase = Array.isArray(data.poems) ? data.poems : [data.poems];
// console.log(poemDatabase); // 打印读取的数据

// fetch('tang_300-song_300.json')
// .then(response => response.json())
// .then(data => {
//     console.log(data); // data已是解析后的数组或对象
//     // 若需强制转为数组，可通过Array.isArray()判断
//     const poemDatabase = Array.isArray(data) ? data : [data];
// })
// .catch(error => console.error('加载失败:', error));

// 使用 Fetch API 的代码
// let poemDatabase = [];
// async function loadPoems() {
//     try {
//         const response = await fetch('test.json');
//         const data = await response.json();
//         // poemDatabase = data.poems;
//         poemDatabase = Array.isArray(data.poems) ? data.poems : [data.poems];
//         console.log('数据已加载:', poemDatabase);
//     } catch (error) {
//         console.error('加载失败:', error);
//     }
// }
// loadPoems();

// 诗词数据库 - 动态从 JSON 文件加载
let poemDatabase = [];

// 异步加载诗词数据
async function loadPoems() {
    try {
        const response = await fetch('tang_300-song_300.json');
        const data = await response.json();
        poemDatabase = Array.isArray(data.poems) ? data.poems : [data.poems];
        console.log('数据已加载:', poemDatabase);
        initGame(); // 数据加载后初始化游戏
    } catch (error) {
        console.error('加载失败:', error);
        // 加载失败时可考虑降级为本地内置数据
    }
}


// 游戏状态
let gameState = {
    targetPoem: "",       // 目标诗句
    currentGuess: "",     // 当前猜测
    guesses: [],          // 所有猜测记录
    attempts: 0,          // 尝试次数
    gameOver: false       // 游戏是否结束
};

// DOM元素
const gameBoard = document.getElementById("game-board");
const poemInput = document.getElementById("poem-input");
const submitButton = document.getElementById("submit-guess");
const attemptsDisplay = document.getElementById("attempts");
const hintDisplay = document.getElementById("hint");

// 初始化游戏
function initGame() {
    // 随机选择目标诗句
    // loadPoems(); // 调用函数加载数据
    if (poemDatabase.length === 0) {
        hintDisplay.textContent = "诗词数据加载中，请稍候…";
        return;
    }
    gameState.targetPoem = poemDatabase[Math.floor(Math.random() * poemDatabase.length)];
    // gameState.targetPoem = poemDatabase[Math.floor(Math.random() * poemDatabase.length)];
    
    // 重置游戏状态
    gameState.guesses = [];
    gameState.attempts = 0;
    gameState.gameOver = false;
    
    // 更新UI
    attemptsDisplay.textContent = gameState.attempts;
    hintDisplay.textContent = `提示：目标诗句有 ${gameState.targetPoem.length} 个字`;
    
    // 清空输入框
    poemInput.value = "";
    
    // 创建游戏棋盘
    createGameBoard();
    
    console.log("目标诗句:", gameState.targetPoem); // 调试用，实际游戏中应隐藏
}

// 创建游戏棋盘
function createGameBoard() {
    gameBoard.innerHTML = "";
    
    // 创建6行猜测区域（类似Wordle的6次尝试）
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("div");
        row.className = "guess-row";
        
        // 创建与目标诗句长度相同的格子
        for (let j = 0; j < gameState.targetPoem.length; j++) {
            const cell = document.createElement("div");
            cell.className = "guess-cell";
            
            // 如果已经有猜测，显示相应内容
            if (i < gameState.guesses.length) {
                cell.textContent = gameState.guesses[i][j];
                
                // 根据猜测结果设置颜色
                const evaluation = evaluateGuess(gameState.guesses[i]);
                if (evaluation[j] === "correct") {
                    cell.classList.add("correct");
                } else if (evaluation[j] === "present") {
                    cell.classList.add("present");
                } else {
                    cell.classList.add("absent");
                }
            }
            
            row.appendChild(cell);
        }
        
        gameBoard.appendChild(row);
    }
}

// 评估猜测结果
function evaluateGuess(guess) {
    const target = gameState.targetPoem;
    const result = Array(guess.length).fill("absent");
    const targetLetterCount = {};
    const guessLetterCount = {};
    
    // 首先标记所有正确位置的字（绿色）
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === target[i]) {
            result[i] = "correct";
            
            // 记录已匹配的字
            if (!targetLetterCount[guess[i]]) {
                targetLetterCount[guess[i]] = 0;
            }
            targetLetterCount[guess[i]]++;
        }
    }
    
    // 然后标记存在但位置错误的字（黄色）
    for (let i = 0; i < guess.length; i++) {
        if (result[i] !== "correct") {
            // 计算目标中该字的总出现次数
            const totalInTarget = (target.match(new RegExp(guess[i], "g")) || []).length;
            
            // 计算已标记为正确的该字次数
            const alreadyMatched = targetLetterCount[guess[i]] || 0;
            
            // 计算当前猜测中该字已出现的次数
            if (!guessLetterCount[guess[i]]) {
                guessLetterCount[guess[i]] = 0;
            }
            guessLetterCount[guess[i]]++;
            
            // 如果目标中有该字且未全部匹配
            if (totalInTarget > alreadyMatched && 
                guessLetterCount[guess[i]] <= totalInTarget) {
                result[i] = "present";
                
                // 更新已匹配的字计数
                targetLetterCount[guess[i]] = (targetLetterCount[guess[i]] || 0) + 1;
            }
        }
    }
    
    return result;
}

// 提交猜测
function submitGuess() {
    const guess = poemInput.value.trim();
    
    // 验证输入
    if (gameState.gameOver) {
        showMessage("游戏已结束，请重新开始！");
        return;
    }
    
    if (guess.length !== gameState.targetPoem.length) {
        showMessage(`请输入 ${gameState.targetPoem.length} 个字的诗句！`);
        return;
    }
    
    if (!isValidPoem(guess)) {
        showMessage("请输入有效的诗句！");
        return;
    }
    
    // 记录猜测
    gameState.guesses.push(guess);
    gameState.attempts++;
    attemptsDisplay.textContent = gameState.attempts;
    
    // 检查是否猜中
    if (guess === gameState.targetPoem) {
        gameState.gameOver = true;
        showMessage("恭喜你猜中了！🎉", true);
        submitButton.textContent = "再来一局";
    } else if (gameState.attempts >= 6) {
        gameState.gameOver = true;
        showMessage(`游戏结束！正确答案是：${gameState.targetPoem}`, true);
        submitButton.textContent = "再来一局";
    } else {
        // 清空输入框，准备下一次猜测
        poemInput.value = "";
    }
    
    // 更新游戏棋盘
    createGameBoard();
}

// 验证输入是否为有效诗句（简化版，实际应用中可以使用更复杂的验证）
function isValidPoem(poem) {
    // 这里可以添加更复杂的验证逻辑
    // 目前仅检查是否为中文字符
    return /^[\u4e00-\u9fa5]+$/.test(poem);
}

// 显示消息
function showMessage(message, isSuccess = false) {
    hintDisplay.textContent = message;
    hintDisplay.style.color = isSuccess ? "#6aaa64" : "#d32f2f";
}

// 事件监听
submitButton.addEventListener("click", function() {
    if (gameState.gameOver) {
        initGame();
        submitButton.textContent = "提交";
    } else {
        submitGuess();
    }
});

poemInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        if (gameState.gameOver) {
            initGame();
            submitButton.textContent = "提交";
        } else {
            submitGuess();
        }
    }
});

// 页面加载时先加载诗词数据
loadPoems();

// 开始游戏
initGame();
