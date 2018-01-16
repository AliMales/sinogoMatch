var color = 'black';
var stone = [];
var stoneFlag = [];
var stoneHasAir = [];
var eatI = 0,
    eatJ = 0;
var Black = 2,
    White = 1,
    Empty = 0;
var eatCount = 0;
//$(document).ready(function () {
//  
//});
//禁止右键菜单：
$(".chessboard").contextmenu(function () {
    return false;
});
//画棋盘：
function createBoard(boardSize) {
    for (var i = 0; i < boardSize; i++) { //先循环x
        stone[i] = [];
        for (var j = 0; j < boardSize; j++) { //再循环y
            stone[i][j] = 0;
            var _div = $('<div>');
            _div.addClass('chess');
            _div.attr('id', j + '-' + i);
            $('.chessboard').append(_div);
            if (i == 0) _div.addClass('top');
            if (i == boardSize - 1) _div.addClass('bottom');
            if (j == 0) _div.addClass('left');
            if (j == boardSize - 1) _div.addClass('right');
        }
    }
};

//画布局
function initLayout(layout){
	for(var i=0;i<layout.length;i++){
		var sub = layout[i];
		pushStones(sub)
	}
}

function pushStones(sub,s){
	var id = sub.id;
	var el = $("#"+id);
	var cls = el.attr("class")
	el.addClass(' marks ');
	if(sub.color==1){
		el.html('<em class="micon-black marks"></em>');
	}else{
		el.html('<em class="micon-white marks"></em>');
	}
	return;
	var color = sub.color==1?'white':'black';
	var className = 'active '+color;
	var el = $("#"+id);
	el.addClass(' active '+color);
	var splits = id.split("-")
	var j = splits[0];
	var i = splits[1];
	
	if(s){
		answerSgf+=';'
		answerSgf+=(sub.color==1?"W[":"B[");
		answerSgf+=sub.name;
		answerSgf+="]"
		var cls = sub.color==1?'black-word':'white-word';
		el.addClass(cls);
		el.html(s+1);
		
        if (stone[i][j] == 0) {
			stone[i][j]=sub.color;
            eatenChesscount(i, j, sub.color, boardSize);
        };
	}
	
	//j - i
	stone[i][j]=sub.color;
}

function MouseDown(event) {
    var event = event || window.event,
    target = event.target,
    data = target.id.split('-');//6-5
    var x = data[0],
        y = data[1];
    var i = 1 * y,
        j = 1 * x;
    if (target.className !== 'chessboard') {
        if (target.className.indexOf('active') == -1) {
        	showChangeDialog(event,j+"-"+i);
        };
    };
};

//初始化矩阵B都为false   
function initFlagMatrix(boardSize) {
    for (var i = 0; i < boardSize; i++) {
        stoneFlag[i] = [];
        stoneHasAir[i] = [];
        for (var j = 0; j < boardSize; j++) {
            stoneFlag[i][j] = false;
            stoneHasAir[i][j] = false;
        }
    }
}

function hasAir(i, j, type) {
    if (stone[i][j] == 0)
        return true;
    if (stone[i][j] != type) {
        stoneHasAir[i][j] = false;
        return false;
    }
    eatCount++;
    stoneFlag[i][j] = true;
    if (i > 0 && !stoneFlag[i - 1][j] && hasAir(i - 1, j, type)) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if (i < (boardSize - 1) && !stoneFlag[i + 1][j] && hasAir(i + 1, j, type)) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if ((j > 0 && stoneFlag[i][j - 1] && stoneHasAir[i][j - 1]) ||
        (j > 0 && !stoneFlag[i][j - 1] && hasAir(i, j - 1, type))) {
        stoneHasAir[i][j] = true;
        return true;
    }
    if ((j < boardSize - 1 && stoneFlag[i][j + 1] && stoneHasAir[i][j + 1]) || (j < boardSize - 1 && !stoneFlag[i][j + 1] && hasAir(i, j + 1, type))) {
        stoneHasAir[i][j] = true;
        return true;
    } else {
        stoneHasAir[i][j] = false;
        return false;
    }
}

//将与A[i][j]相连的相同类型的棋子全部吃掉    
function eatChess(i, j, type) {
    if (stone[i][j] != type) return;
    stone[i][j] = 0; //吃掉子  
    var id = j + "-" + i;
    var stoneC = type == 1 ? 'white' : 'black';
    $("#" + id).removeClass('active ' + stoneC);
    if (i > 0) eatChess(i - 1, j, type);
    if (i < boardSize - 1) eatChess(i + 1, j, type);
    if (j > 0) eatChess(i, j - 1, type);
    if (j < boardSize - 1) eatChess(i, j + 1, type);
}

//查找整个棋盘看棋子是否有气    
function hasAirOfType(type) {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (stone[i][j] != type || stoneFlag[i][j])
                continue;
            eatCount = 0;
            if (!hasAir(i, j, type)) {
                eatI = i, eatJ = j;
                return false;
            }
        }
    }
    return true;
}

//当位置[i,j]放个黑白子的时候吃掉子的个数    
function eatenChesscount(i, j, type, boardSize) {
    initFlagMatrix(boardSize)
    var self_hasAir = hasAir(i, j, type);
    eatCount = 0;
    eatI = 0;
    eatJ = 0;
    var other_type = (type == 1 ? 2 : 1);
    initFlagMatrix(boardSize)
    var other_hasAir = hasAirOfType(other_type);
    if (!self_hasAir && other_hasAir) {
        eatChess(i, j, type);
    }
    if (!other_hasAir) {
        eatChess(eatI, eatJ, other_type);
        eatenChesscount(i, j, type, boardSize);
    };
};