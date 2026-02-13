import { inventory } from '../inventory.js';

/* ========= ITEM ========= */
class Item {
  constructor(x, worldArt, popupArt, description) {
    this.x = x;
    this.worldArt = worldArt;
    this.popupArt = popupArt;
    this.description = description;
  }
}

/* ========= PLAYER ========= */
const walkFrames = [
`  O\n /|\\\n / \\`,
`  O\n /|\\\n /| `,
`  O\n /|\\\n  |\\`
];

let player = { x: 50, y: 130, speed: 4 };
let frame = 0, frameTimer = 0;

const playerDiv = document.getElementById('player');
const gameDiv = document.getElementById('game');
const popup = document.getElementById('popup');
const textbox = document.getElementById('textbox');

/* ========= DEINE ASCIIS ========= */
const BIG_PASS_ASCII = `
@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@=@@@@ @
 @@@ @#**%####=+@@@% @@ @ @.# *- * +@ =*@ @.@ @ @@ @ @ @@ @ @-@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+.
+@@@            @@@. :  + . :  @ : @  .   @ @ @   @@ @ @@  ## # @@@@@@* @ @ @ :@ # @ +# @ =@ @@  @@@+
+@@@ +% @@@ @.  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@=@@@=@@@@@@@@@@@@@@@@  @  @@@@ +@ :@  @.@@@:@ @@*@+
*@@@   @    #   @@@ @ =   =. % @@  *        @@@@@@@@@@@@@@@ @ @ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*%@@:
=@@@            @@@+ .@*@ -..@   @=+ .#@-@@@@@@@@@@@@@@@@@+     @@@@@@@@@@@@@@@@@@@@@@@@#@*@@@%@%@@@ 
+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-@@@@@@@@@@@@@@@@@@@%@@*@@+@@@@@@
=@@@ -.-:----:-:=#@@@@@*@@@@@@+-:::::::-: @@ @ @ :@.=:+@ @:@   %@@ +@##*%#=%.@@@@@%@%@@@@%@@@=@#@*@#*
=@@@:@%%#@#@#@@@@@.          #@@@@@%%%%%@:@@ @=@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@%@@@@@@@@@@%%@%@#@*@@#
=@@@:@@%@%%%@@@.    -=-@+=@@*%   @@@%%@%%:@@ +#CLENSY@  @  @@+@%@@@:@#+#@@@@@*::=@#@%@%@#@@@@@@@@@@#-
=@@@:%%@#%@@@=  @@@@-::-*:..:*@@# -@@@@@@-@@@@@@@@@@=@@**@@@@@@@@@@@@*@@@@@%@@@@@@@ @+@ @-@@@@@@##%@*
=@@@:@%%%@@@  @@@    ..-:-- *+::@# -@@%%%.@@ #%BLACKWOOD@@@@@@@@@@@@+@@@@ # @@ @@@+@ @@@@@@@@@%@@%#@@
=@@@:%%@@@%:.-@    -   -     +@%  @.*@%%%:@@@@@= +**- % .@@@@@@@@@@@@@=-=@@@@ @.@-:@@.@ @@*@@@@@*@#@.
=@@@:%%@@@+ %@ @@@@@ @@@+#:@%=*@@*:@ @@@%:@@  @ @ - @ * @@            .@=:@ @:#@.+@ @@.@@+@@%%%%+@@@.
+@@@-%@@#+ -@ @@@@@-@@%.*@@@@@-:@@ @* @@%.@@@@@@@=@@@@@@@@@@@@@@@@@@@@ @ @ @@@#-@@@ =@@@@@@=@@@@@@@@#
=@@@:%@@-= @ -@#*= @%@=@@-#+++% =+ @%=@@@.@@@ :05.06.1959#@:@%@ +.@@%@ @ @=@@ @@@@@@@@@@@@@@@@@%@*#@=
=@@@-@@++. @ +   :#@=:  *@@@@@@@.-.=*==@@:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@=@@@%
=@@@-@%==+=+ @@@@%-+@@@@@=   %%:#  :*::@@-@@  =   @  :  @@ .    @@@     @                   @@@@@@@@@
=@@@-@=:=%@  @    =  .@@.- -    @# @: *:@=@@  @POLAND  @@@@@@@   @   * @@@@@    @@@@@@@@@@@@@@@@@%@@-
=@@@=@-%+@- @@@@@@@@@+@@-@@@@@@@@@  @:%-%=@@@ @@@@@ @+@@@ @-@ #  @@ -@@@#@* @  :@-@@@@@@@@@@@@@@@#@@+
=@@@=@--@@  @@@@@@@@%-#@ =@@@@@@#@+ #*-%: @@@%@ @ @ @%@ @ @ @@@  @@. @@-@% =#*@@@@%@@@@@@@@@@@@+=
+@@@++ .*@  #%@@@@%=:*@@@ :%@@@#=+  :+=#@ @@   @  @  @  @ @   @     @         @@@@@@@@@@%@@@@@@@@@@@#
=@@@-.==@@  =##@@@@@..    #@@@@%=@--::#-  @@@   @ @@@ @- @@@@@@@@@@@@@@@@@@@@@@@@@@%@%@@@@@@@@@@@@@@*
=@@@..*-%@   @:   *@@@@@@@@#: . +@ -: *%  @@@  @@@- @ @@ @@*:@@@@@@%=@@@%.@.@@@@@@@@@@@@@@@@@@@@@@@@*
=@@@-@@--@* . @*@@:         @@+#@ :-.+@@% @@@@@@@@@@@@@@@@@@@@@@#@=#+%%@@@@@@@-%%@@@@@@@@@@@=@%@@@@@+
=@@@=@#.=*@ : @##%@@@=::+*@@%=*@% = :@+*. @@   . @      @      -@@@@@@@@#%@%@@@@@@@@@@@@@@@@@@@@%@@@*
=@@@:%+ @:@*  +**+@@@@@@@@@@+*:% .: @@@%: @@ @@ #@ @@@@ @@@@@@@@@#@@@@%@%@@@@@@ @ @@  @ @@ @@  @@*@@%
=@@@=@@@@*@@% =@#  #*#+%%**  .%@  :@@@:#@ @@@: @@@@    @@@ @    @@@+ @@@@@ @** @@  @  @ @@  @  @@@@@-
=@@@%@@*%:-@@  @*#=       ::+#** *@-+  +- @@@@@@%@@@@@@@@@@@@@@@@@@@@@@@+@+@@@@@@@@@@@@@@@@@@@@@@@@@*
*@@@      .**@ @@%*%@@@@@@%*#%#@  @  . +  @#@*@%@@: @@@@@#@@@@@@@@@@@-*@#@@**@+@#@%*#%@@@@@#@#@@**=@ 
*@@@ @+.- .    *@#+::: ::-++@#=@ :@:  *@@@@+@@@@. @@     @  @4681576@@@@#%%*@@#@+@%#@*#*+##*@@@@@@@@.
*@@@  =*@@@%@   @@@. @@@@#:*@@#@: @@@ @   @@@@=  = @@@ @@@ @%%@@@@@@@%%##%%**.=-%@=%*@@@@@@@%.%#@%@@.
.@@@ . @% @=- .                   @ @ @   @% @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-*@@@@%%@%@@@@@@@=%@ 
@.@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#@@ @*.-:%-*#@@@%@@%@@@@@@@@#@@@@%@%@@#@%@@@@#%@@@ @
`;

const BIG_PUPPY_ASCII = `
                                          .-.      =@@*                                                      
                                        .*@@@@@@@                                                      
                                          @@@@:                          .                             
                            .              @@:                   *@#==--+==:                           
                            =-              @@@@             %==@@@@@%#+===-                           
                           .#+.             #@@@@             -@@@@@@%#***+-=                          
                           -=#              *@@@@*..        +%@@@@@@@@@@%*==+:                         
                           .=#@.            =@@@@@@@@*:      -#@@@@@@@@@@%*--:                         
                           =+#@%           +@@@@@@@@@@@%@#:  = +%@@@@@@@@%*-::                         
                            .#@@@         =.#@@@@@@@@%=:        :=#@@@%%%%*==-:                        
                            .*@@@@=      :  :+@@@@@@@@+          :*%@@@@@@%#+-                         
                             +***@@@-    .   -*@@@@@@@+           .-+#@@@@##@*.                        
                            -*+.           ..+#@@@@@@@-           ..:::-*%*:                           
                            :+=-.     ....:.-*#%@%*%@@=..:-::.          =+.                            
                              +#*==--=%@@@@#=: .:=:**::--#@@@@+      .-**=.                            
                              -::=-:=%@@@@*@= .        .%@@=@@@%:.  -=*@@%=                            
                                .    +@%###:   ..       -@@@@@@#  .:. =#@:                             
                                 -:.           -++-.      =+%@*    ..+-**=.                            
                                :+-.         -@@@@@@%-.           .=.:-:.:.                            
                              -*:..          .%@@@@@+.              :--=-.                             
                              -%%:            :%@@@%-               . ...                              
                               :==.          .-**###+.             :+#*=+*                             
                                 %@-  .   ..                       =+@@@%*=                            
                                -@@@#-                       ....#@@@%@@@@+                            
                              %@@@@@@@@%-:                  ..=+#%@@@@@@@#-                            
                              *@@@@@@@@@@@%=::.   .      .::**@@@@@@@@@@@@@@%.                         
                              %@@@@@@@@@@@@@@%#*+=:-: :..*#%@@@@@@@@@@@@@@@@@%.                        
                             .@@@@@@@@@@@@@@@@@*++=*#-::=%%%@@@@@@@@@@@@@@@@@%.                        
                             @@@@@@@@@@@@@@@%+-.-%+#+==+**#%#@@@@@@@@@@@@@@@@@*                        
                            :@@@@@@@@@@@@@=::=::%#*#+===-=+++#@%@@@@@@@@@@@@@@#                        
                           +@@@@@@@@@@@@%*-:-::*#+**=--.::-*#=+%@@@@@@@@@@@@@@@=                       
                           .@@@@@@@@@@%*+-::-:===+--:::..   :#+%@@%#%@@@@@@@@@#-                       
                           -@@@@@@@@+=:...::...:=..::..       -=##%*=*%@@%%@@@%+                       
                           =%@@@@@%*+=:   .   .:   .:. .       .--:=+=+%@%#+*%#:                       
                           +@@@@#*##=-.  .     ..     .           ..:::.=%@%##*:                       
                            %@*++#--+#:  .                        .+*=   -#@@%*                        
                           :#@@#*+.%@*-:      -+-   .:..  .       :-*@#. :#**%+                        
                            +#*+#@@@=**-     .-*#*-==: : .---::-=-.-%+%@- +@#+                         
                             =%@@@@-%%+      .-+*%%*:  --=+*+-=-:=*##%##@+*##                          
                             .@@@@@@@*-       .::-=-:=+**-==+==----**%%+*@#*-                          
                             -#%@%##*-::       :**#*#*%+-=:-+*==:.:=%#@#===.                           
                                   =--:.        .+@@@%@##*+*+=-:. .:=-----.                            
                                  ..::.:.:    .-+=-+@@%#**++-.:      ..:.                              
                                  ..:-:.:.    .:+++*####*++-..     . .-=++.                            
                                       .:          ... =+=  .     .--=*%@%:                            `;


const puppyPetting1 = `                                                                                                                                                                                                          
                                           ..                                                          
 .:.                                .:-===++****:                                                      
 :===++-::..                 ..:======+++++*********+=:.                                               
 :--==========-::....::--=====+++++++++++++++++*****+++*++****--                                       
 .---::::------===++++++++++++++++++====--::::-----=====++++++++++=:.                                  
 ............:::-----=======------:::::...... ..............::------:::..:-----::.                     
  .............::::--==--:::.........           ...     ..     ..      ...       .:.                   
  ....      ...::::---:::......         .    .  ......... ..... ..........                             
  ............::::::........            .. ....   ...                                                  
 .............::.....                .....                                                             
         .....:...                .....                                                                
                ..               ....                                                                  
                   . .............                                                                     
                                  .                                                                    
                                  ..                                                                   
                                         ..:.-**=                                                      
                                  .. ....=#%%%%##                                                      
                            .....        .#%%#:                    ......:.                            
                            :.            .#*:                  .=*=----=--:                           
                            --              ####             +--*####+==-==-.                          
                           :+=:             +%%%*            .:*%%%%#+=====--                          
                           :-=.             =##%*=..        =+%#%%##%##*+==--:                         
                           .-=*.            -%%%%%%#*=:     .:+##%%%##***+=--:                         
                           -==++           -*#%%%%%#**#+*+:..-.-+*##%%#**+=-::                         
                            .+**+        .-:=*#%%%%%#+-:    ....:-+*#*++++=--::                        
                            .=*##*-     .:..:-*#%%%%%*=.      ...:=+******+==-.                        
                            .-===*##-....:...:=#%%%%%#-.         .:--=****==*=.                        
                            :=-:.   ..... .::-+#%###%#-..... .....:::::-=+=:                           
                            :--::.....::::::-==+*+=+#+-:::-:::..........--.                            
                              -==-----+#%%*=-::::-:==::--=+##*-......:-==-.                            
                              :::--:-+#%%*=*-.:........:+**-#%#+::..--=*#+-.                           
                               .....:=#+=+=:...:::.....:-*#####=..:::.-=*:                             
                                .:::...........:--:.......-=+*=....::=-==-:                            
                                :=-:.........:*%**##+-:...........:-::-::::.                           
                              :=::::.........:+%###*-..............::----:.                            
                              :++:...    .....:+***+:...............:::::.                             
                              .:--:.... .....:-=====-:.   .........-===--=.                            
                                .+*-..:..:::.......................-=***+=-                            
                                -*##=-::::......    .........::::=##*+***+=.                           
                             .+###%%%#++-::................:::--++#%###**+:                            
                              =#%%%%%#####+-:::...:......:::==#%#%%%###%%%##+:                         
                              +#%%%%%%%%%%##*++==-:-:.:::==+*##%%%#%%%##%%###+.                        
                             .*%%%%%%%%%%%%%##*=-=-==-::-+++*##%%%%%%%%%%%%%#+:                        
                             *%%%%%%%%%%%%%#+=-:-+-==---==+++**#%%%%%%%%%%#%##=                        
                            :#%#%%%%%#*#%*-::-::+====-----==-+++####%%%%%##*##+                        
                           -*###%%######+=-:-::==-==---:::-=+--+*#**#**#%%%%##*-                       
                           .+**#####**+=--::-:--==--:::::...:==+*#+++****###**+:                       
                           -*######*--::::::::::-:::::::......--=++=-=+**++***+-.                      
                           -+*####+=--:...:...::...:::::... ...:-::----+*+=-=++:                       
                           =*##++==+-:...:.....::. ...:..    . ...::::::-+*+++=:                       
                            +*=--=::==:..:.........  .....   .....:==-...-=**+=.                       
                           :+**+=-:+*=-:... ..-=-...::::..:.......:-=*+..:===+-.                       
                            -+==+*##-==-.....:-=+=----.:.:---::---:-+=+*:.-*=-.                        
                            .-+*#%*-++-......:-==++=::.---===---:-===+++*===+.                         
                             .*###***=:...  ..:::---:-===----------==++==++=:                          
                             :=+*+++=-::..  ...:======+---:--=--:::-++++---:.                          
                                  .-::::......:.:-*#*+*======--:::::--::-:..                           
                                 ..:::::::....:----=**+====--:::.....::::.                             
                                  .::-::::....::--==++===---:::....:::----:                            
                                      .::       . .::..---..:.  ..:::-=+*+:                            
`;

const puppyPetting2 = `                                                                                                       
                                                                                                    
                                       .:+++++:                                                        
 :==:                            ..---===++*+*+**+=.                                                   
 :==++++++==:             .::--===+++++**++********++++++=.                                            
 .-----================+++++++++++++++++====+++++++++++++***##*++:                                     
 .::::::::::-----=====+++++++++=======--::.....:::-----=========++===-:..                              
 .............::::---====----::::::......       ..  .   ........::.......:---::...                     
  ....     ....::::-----:::.......              ...    ...  .. ..     ...       ....                   
  ......    ...::::::::.......           .   ..  .  ...      ... ...........                           
 .............:::::........            .. .....   ..                                                   
   ...........::....                ....  +##*.                    ......:.                            
             .....               .....    .#*:                  .=*=----=--:                           
                 .        ...  .....        ####             +--*####+==-==-.                          
                      .........             +%%%*            .:*%%%%#+=====--                          
                           .:=.             =##%*=..        =+%#%%##%##*+==--:                         
                           .-=*.            -%%%%%%#*=:     .:+##%%%##***+=--:                         
                           -==++           -*#%%%%%#**#+*+:..-.-+*##%%#**+=-::                         
                            .+**+        .-:=*#%%%%%#+-:    ....:-+*#*++++=--::                        
                            .=*##*-     .:..:-*#%%%%%*=.      ...:=+******+==-.                        
                            .-===*##-....:...:=#%%%%%#-.         .:--=****==*=.                        
                            :=-:.   ..... .::-+#%###%#-..... .....:::::-=+=:                           
                            :--::.....::::::-==+*+=+#+-:::-:::..........--.                            
                              -==-----+#%%*=-::::-:==::--=+##*-......:-==-.                            
                              :::--:-+#%%*=*-.:........:+**-#%#+::..--=*#+-.                           
                               .....:=#+=+=:...:::.....:-*#####=..:::.-=*:                             
                                .:::...........:--:.......-=+*=....::=-==-:                            
                                :=-:.........:*%**##+-:...........:-::-::::.                           
                              :=::::.........:+%###*-..............::----:.                            
                              :++:...    .....:+***+:...............:::::.                             
                              .:--:.... .....:-=====-:.   .........-===--=.                            
                                .+*-..:..:::.......................-=***+=-                            
                                -*##=-::::......    .........::::=##*+***+=.                           
                             .+###%%%#++-::................:::--++#%###**+:                            
                              =#%%%%%#####+-:::...:......:::==#%#%%%###%%%##+:                         
                              +#%%%%%%%%%%##*++==-:-:.:::==+*##%%%#%%%##%%###+.                        
                             .*%%%%%%%%%%%%%##*=-=-==-::-+++*##%%%%%%%%%%%%%#+:                        
                             *%%%%%%%%%%%%%#+=-:-+-==---==+++**#%%%%%%%%%%#%##=                        
                            :#%#%%%%%#*#%*-::-::+====-----==-+++####%%%%%##*##+                        
                           -*###%%######+=-:-::==-==---:::-=+--+*#**#**#%%%%##*-                       
                           .+**#####**+=--::-:--==--:::::...:==+*#+++****###**+:                       
                           -*######*--::::::::::-:::::::......--=++=-=+**++***+-.                      
                           -+*####+=--:...:...::...:::::... ...:-::----+*+=-=++:                       
                           =*##++==+-:...:.....::. ...:..    . ...::::::-+*+++=:                       
                            +*=--=::==:..:.........  .....   .....:==-...-=**+=.                       
                           :+**+=-:+*=-:... ..-=-...::::..:.......:-=*+..:===+-.                       
                            -+==+*##-==-.....:-=+=----.:.:---::---:-+=+*:.-*=-.                        
                            .-+*#%*-++-......:-==++=::.---===---:-===+++*===+.                         
                             .*###***=:...  ..:::---:-===----------==++==++=:                          
                             :=+*+++=-::..  ...:======+---:--=--:::-++++---:.                          
                                  .-::::......:.:-*#*+*======--:::::--::-:..                           
                                 ..:::::::....:----=**+====--:::.....::::.                             
                                  .::-::::....::--==++===---:::....:::----:                            
                                      .::       . .::..---..:.  ..:::-=+*+:                            
                                                                                                       
`;

/* ========= ITEMS ========= */
let items = [
  new Item(
    300,
    '[~~]',
    BIG_PASS_ASCII,
    'A mysterious pass.'
  ),
  new Item(
    550,
    '(ᵔᴥᵔ)',
    BIG_PUPPY_ASCII,
    'A cute puppy.'
  )
];

/* ========= POI RENDER ========= */
let poiDivs = [];
function renderPOIs() {
  poiDivs.forEach(d => d.remove());
  poiDivs = [];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'ascii';
    div.style.left = item.x + 'px';
    div.style.top = '140px';
    div.textContent = item.worldArt;
    gameDiv.appendChild(div);
    poiDivs.push(div);
  });
}

/* ========= INPUT ========= */
const keys = { a:false, d:false };
let canInteract = false;
let currentPOI = null;

window.addEventListener('keydown', e => {
  if (e.key === 'a') keys.a = true;
  if (e.key === 'd') keys.d = true;

  if (e.key === 'e' && canInteract && currentPOI) {
    popup.innerHTML = '';
    const pre = document.createElement('pre');
    pre.textContent = currentPOI.popupArt;
    pre.style.width = '120ch'; // Slightly bigger width
    pre.style.height = '60em'; // Slightly bigger height
    pre.style.overflow = 'hidden';
    pre.style.display = 'flex';
    pre.style.alignItems = 'center';
    pre.style.justifyContent = 'center';
    pre.style.textAlign = 'center';
    popup.appendChild(pre);
    // Puppy: show Pet button, not Collect
    if (currentPOI.worldArt === '(ᵔᴥᵔ)') {
      const petBtn = document.createElement('button');
      petBtn.textContent = 'Pet';
      petBtn.style.display = 'block';
      petBtn.style.margin = '18px auto 0 auto';
      petBtn.style.padding = '8px 18px';
      petBtn.style.background = '#333';
      petBtn.style.color = '#fff';
      petBtn.style.border = '1px solid #fff';
      petBtn.style.borderRadius = '6px';
      petBtn.style.fontFamily = 'monospace';
      petBtn.style.fontSize = '1em';
      petBtn.style.cursor = 'pointer';
      petBtn.onclick = () => {
        let count = 0;
        const petFrames = [puppyPetting1, puppyPetting2];
        function animatePet() {
          pre.textContent = petFrames[count % 2];
          count++;
          if (count < 6) {
            setTimeout(animatePet, 350);
          } else {
            pre.textContent = currentPOI.popupArt;
          }
        }
        animatePet();
      };
      popup.appendChild(petBtn);
    } else if (!inventory.has(currentPOI)) {
      const collectBtn = document.createElement('button');
      collectBtn.textContent = 'Collect';
      collectBtn.style.display = 'block';
      collectBtn.style.margin = '18px auto 0 auto';
      collectBtn.style.padding = '8px 18px';
      collectBtn.style.background = '#333';
      collectBtn.style.color = '#fff';
      collectBtn.style.border = '1px solid #fff';
      collectBtn.style.borderRadius = '6px';
      collectBtn.style.fontFamily = 'monospace';
      collectBtn.style.fontSize = '1em';
      collectBtn.style.cursor = 'pointer';
      collectBtn.onclick = () => {
        inventory.add(currentPOI);
        items = items.filter(item => item !== currentPOI);
        renderPOIs();
        renderInventoryGrid();
        textbox.textContent = `${currentPOI.worldArt} added to inventory!`;
        popup.style.display = 'none';
        canInteract = false;
        currentPOI = null;
      };
      popup.appendChild(collectBtn);
    }
    popup.style.display = 'block';
  }
  if (e.key === 'Escape') popup.style.display = 'none';
  if (e.key === 'a') keys.a = true;
  if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', e => {
  if (e.key === 'a') keys.a = false;
  if (e.key === 'd') keys.d = false;
});

/* ========= GAME LOOP ========= */
function update() {
  player.x += keys.a ? -player.speed : keys.d ? player.speed : 0;
  player.x = Math.max(0, Math.min(player.x, 760));

  if (keys.a || keys.d) {
    frameTimer++;
    if (frameTimer > 6) {
      frame = (frame + 1) % walkFrames.length;
      frameTimer = 0;
    }
  } else frame = 0;

  canInteract = false;
  currentPOI = null;
  items.forEach(item => {
    if (Math.abs(player.x - item.x) < 30) {
      canInteract = true;
      currentPOI = item;
    }
  });
}

function render() {
  playerDiv.style.left = player.x + 'px';
  playerDiv.style.top = player.y + 'px';
  playerDiv.textContent = walkFrames[frame];

  textbox.textContent = canInteract ? 'E to interact' : '';
  renderPOIs();
}

(function loop(){
  update();
  render();
  requestAnimationFrame(loop);
})();

// Create inventory button
const invBtn = document.createElement('button');
invBtn.textContent = 'Inventory';
invBtn.style.position = 'fixed';
invBtn.style.bottom = '24px';
invBtn.style.right = '24px';
invBtn.style.padding = '12px 18px';
invBtn.style.background = '#222';
invBtn.style.color = '#fff';
invBtn.style.border = '2px solid #fff';
invBtn.style.borderRadius = '8px';
invBtn.style.fontFamily = 'monospace';
invBtn.style.fontSize = '1.1em';
invBtn.style.cursor = 'pointer';
document.body.appendChild(invBtn);

// Create inventory modal
const invModal = document.createElement('div');
invModal.style.display = 'none';
invModal.style.position = 'fixed';
invModal.style.left = '50%';
invModal.style.top = '50%';
invModal.style.transform = 'translate(-50%, -50%)';
invModal.style.background = '#181818';
invModal.style.color = '#fff';
invModal.style.padding = '32px 40px';
invModal.style.border = '2px solid #fff';
invModal.style.borderRadius = '12px';
invModal.style.zIndex = '1000';
invModal.style.boxShadow = '0 4px 32px #000a';

// Modal close button
const closeBtn = document.createElement('button');
closeBtn.textContent = 'Close';
closeBtn.style.marginBottom = '18px';
closeBtn.style.background = '#333';
closeBtn.style.color = '#fff';
closeBtn.style.border = '1px solid #fff';
closeBtn.style.borderRadius = '6px';
closeBtn.style.fontFamily = 'monospace';
closeBtn.style.fontSize = '1em';
closeBtn.style.cursor = 'pointer';
closeBtn.style.display = 'block';
closeBtn.style.marginLeft = 'auto';
closeBtn.style.marginRight = 'auto';
invModal.appendChild(closeBtn);

// Inventory grid
const grid = document.createElement('div');
grid.style.display = 'grid';
grid.style.gridTemplateColumns = 'repeat(4, 48px)';
grid.style.gridTemplateRows = 'repeat(4, 48px)';
grid.style.gap = '12px';
grid.style.marginTop = '12px';
grid.style.justifyContent = 'center';
grid.style.alignItems = 'center';
invModal.appendChild(grid);
document.body.appendChild(invModal);

function renderInventoryGrid() {
  grid.innerHTML = '';
  const itemsArr = inventory.getAll();
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.style.width = '48px';
    cell.style.height = '48px';
    cell.style.background = '#222';
    cell.style.border = '1px solid #555';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.fontFamily = 'monospace';
    cell.style.fontSize = '1.2em';
    if (itemsArr[i]) {
      cell.textContent = itemsArr[i].worldArt;
      cell.title = itemsArr[i].description || '';
      cell.style.cursor = 'pointer';
      cell.onclick = () => {
        popup.innerHTML = '';
        const pre = document.createElement('pre');
        pre.textContent = itemsArr[i].popupArt;
        pre.style.width = '80ch'; // Slightly bigger width
        pre.style.height = '40em'; // Slightly bigger height
        pre.style.overflow = 'hidden';
        pre.style.display = 'flex';
        pre.style.alignItems = 'center';
        pre.style.justifyContent = 'center';
        pre.style.textAlign = 'center';
        popup.appendChild(pre);
        // Puppy: show Pet button, not Collect
        if (itemsArr[i].worldArt === '(ᵔᴥᵔ)') {
          const petBtn = document.createElement('button');
          petBtn.textContent = 'Pet';
          petBtn.style.display = 'block';
          petBtn.style.margin = '18px auto 0 auto';
          petBtn.style.padding = '8px 18px';
          petBtn.style.background = '#333';
          petBtn.style.color = '#fff';
          petBtn.style.border = '1px solid #fff';
          petBtn.style.borderRadius = '6px';
          petBtn.style.fontFamily = 'monospace';
          petBtn.style.fontSize = '1em';
          petBtn.style.cursor = 'pointer';
          petBtn.onclick = () => {
            let count = 0;
            const petFrames = [puppyPetting1, puppyPetting2];
            function animatePet() {
              pre.textContent = petFrames[count % 2];
              count++;
              if (count < 6) {
                setTimeout(animatePet, 350);
              } else {
                pre.textContent = itemsArr[i].popupArt;
              }
            }
            animatePet();
          };
          popup.appendChild(petBtn);
        }
        // Add close button to popup
        const closePopupBtn = document.createElement('button');
        closePopupBtn.textContent = 'Close';
        closePopupBtn.style.display = 'block';
        closePopupBtn.style.margin = '18px auto 0 auto';
        closePopupBtn.style.padding = '8px 18px';
        closePopupBtn.style.background = '#333';
        closePopupBtn.style.color = '#fff';
        closePopupBtn.style.border = '1px solid #fff';
        closePopupBtn.style.borderRadius = '6px';
        closePopupBtn.style.fontFamily = 'monospace';
        closePopupBtn.style.fontSize = '1em';
        closePopupBtn.style.cursor = 'pointer';
        closePopupBtn.onclick = () => {
          popup.style.display = 'none';
          invModal.style.display = 'block';
        };
        popup.appendChild(closePopupBtn);
        popup.style.display = 'block';
        invModal.style.display = 'none';
      };
    } else {
      cell.textContent = '';
      cell.title = '';
      cell.onclick = null;
      cell.style.cursor = 'default';
    }
    grid.appendChild(cell);
  }
}

invBtn.onclick = () => {
  renderInventoryGrid();
  invModal.style.display = 'block';
};
closeBtn.onclick = () => {
  invModal.style.display = 'none';
};
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (popup.style.display === 'block') {
      popup.style.display = 'none';
      // If inventory was hidden for inspect, restore it
      if (invModal.style.display === 'none') {
        invModal.style.display = 'block';
      }
    } else if (invModal.style.display === 'block') {
      invModal.style.display = 'none';
    }
  }
});
