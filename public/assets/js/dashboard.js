// function menuBtn(val){
//     var liElements = document.querySelectorAll('.side-menu-li');
//     liElements.forEach(function(li) {
//         li.classList.remove('active');
//     });
    
//     // Add 'active' class to the clicked li element
//     val.classList.add('active');
// }

// function btnClick(val){
//     var liElements = document.querySelectorAll('.active-Icons');
//     liElements.forEach(function(li) {
//         li.classList.remove('active');
//     });
    
//     // Add 'active' class to the clicked li element
//     val.classList.add('active');
// }


document.getElementById('MenuBtn').addEventListener('click',function(){
    const leftMenuBar = document.querySelector('.left-Menu-Bar')
    const leftMenuBarActive = document.querySelector('.left-Menu-Bar-active')
    const rightMenuBar = document.querySelector('.right-Menu-Bar')
    if(leftMenuBar.style.display ==='none'){
        leftMenuBar.style.display ='block'
        leftMenuBarActive.style.display ='none'
        rightMenuBar.style.width = '83vw';
        document.getElementById('graphRow').style.width = '751px';
        document.querySelectorAll('.best-selling-Box').forEach((val) => {
            val.style.width = '360px'
        })
    }else{
        leftMenuBar.style.display ='none'
        leftMenuBarActive.style.display ='block'
        rightMenuBar.style.width = '94vw'
        document.getElementById('graphRow').style.width = '858px';
        document.querySelectorAll('.best-selling-Box').forEach((val) => {
            val.style.width = '400px'
        })
    }
    
})