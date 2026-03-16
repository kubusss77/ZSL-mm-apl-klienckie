-- Poruszanie --

- ruch (komunikacja z grą) odbywa się za pomocą komend wpisywanych w inputa (zatwierdzane enter'em). Na początek:
  E / EAST - przejście na wschód (o ile jest taka możliwość)
  W / WEST - przejście na zachód (o ile jest taka możliwość)
  N / NORTH - przejście na północ (o ile jest taka możliwość)
  S / SOUTH - przejście na południe (o ile jest taka możliwość)
- input zawsze ma fokusa -> nie da się z niego wyjść
- grafiki są podkolorywane odpowiednim tłem

-- Logika --
KOMUNIKATY KIERUNKÓW:
You are going north... (+pozostałe kierunki)
You can't go that way

POLECENIA i możliwe komunikaty:
TAKE (T) X
You are taking X (podniesienie przedmiotu X)
You can't carry it (próba podniesienia przedmiotu o \*\*flaga=0)
There isn't anything like that here (próba podniesienia czegoś czego nie ma na lokacji)

    You are carrying something (można nieść max jeden przedmiot z **flagą 1)
    You are carrying X (niesiony przedmiot)
    You are carrying nothing (nic nie niesiesz)

    You see X, Y, Z

DROP (D) X
You are not carrying anything (puste ręce)
You can't store any more here (max. 3 przedmioty o \*\*flaga=1) => np. 3 przedmioty + 4 częsci owcy na tej samej lokacji
You are about to drop X (odłożenie przedmiotu X)
You are not carrying it (odłożenie przedmiotu którego nie mamy)

USE (U) X
You aren't carrying anything like that (użycie przedmiotu którego nie mamy)
Nothing happened (użycie przedmiotu na złej lokacji)

VOCABULARY (V)
"NORTH or N, SOUTH or S"
"WEST or W, EAST or E"
"TAKE (object) or T (object)"
"DROP (object) or D (object)"
"USE (object) or U (object)"
"GOSSIPS or G, VOCABULARY or V"
"Press any key"

GOSSIPS (G)
"The woodcutter lost his home key..."
"The butcher likes fruit... The cooper"
"is greedy... Dratewka plans to make a"
"poisoned bait for the dragon... The"
"tavern owner is buying food from the"
"pickers... Making a rag from a bag..."
"Press any key"

PRZEDMIOTY:
id_przedmiotu, przedmiot_w_odmianie, \*\*flaga 1/0 (1 - można położyć/podnieść/użyć itp., 0 - cały czas na lokacji, brak interakcji), nazwa_przedmiotu

10 - a KEY,1,KEY
11 - an AXE,1,AXE
12 - STICKS,1,STICKS
13 - sheeplegs,0,sheeplegs
14 - MUSHROOMS,1,MUSHROOMS
15 - MONEY,1,MONEY
16 - a BARREL,1,BARREL
17 - a sheeptrunk,0,sheeptrunk
18 - BERRIES,1,BERRIES
19 - WOOL,1,WOOL
20 - a sheepskin,0,sheepskin
21 - a BAG,1,BAG
22 - a RAG,1,RAG
23 - a sheephead,0,sheephead
24 - a SPADE,1,SPADE
25 - SULPHUR,1,SULPHUR
26 - a solid poison,0,solid poison
27 - a BUCKET,1,BUCKET
28 - TAR,1,TAR
29 - a liquid poison,0,liquid poison
30 - a dead dragon,0,dead dragon
31 - a STONE,1,STONE
32 - a FISH,1,FISH
33 - a KNIFE,1,KNIFE
34 - a DRAGONSKIN,1,DRAGONSKIN
35 - a dragonskin SHOES,1,SHOES
36 - a PRIZE,1,PRIZE
37 - a SHEEP,1,SHEEP

PRZEDMIOTY NA STARCIE:
lokacja (YX) - id_przedmiotu

13 - 31
15 - 27
17 - 14
23 - 10
27 - 18
32 - 32
44 - 21
55 - 33
64 - 24

ZALEŻNOŚCI:
użyty_przedmiot (id_przedmiotu), lokacja (YX), wynik_użycia (id_przedmiotu), komunikat, OK (kamień milowy)

- nowy przedmiot zwykle ląduje w dłoni. Oznaczono "L" jeśli na lokacji (części owcy)
- przedmiot po użyciu znika z rąk
  uwaga: ilość "L" dokładnie taka sama jak \*\*flag 0 - część owcy na lokacji 43 (przedpola pieczary)

10, 56, 11, You opened a tool shed and took an axe
11, 67, 12, You cut sticks for sheeplegs
12, 43, 13(L), You prepared legs for your fake sheep, OK
14, 34, 15, The tavern owner paid you money
15, 37, 16, The cooper sold you a new barrel
16, 43, 17(L), You made a nice sheeptrunk, OK
18, 36, 19, The butcher gave you wool
19, 43, 20(L), You prepared skin for your fake sheep, OK
21, 57, 22, You used your tools to make a rag
22, 43, 23(L), You made a fake sheephead, OK
24, 11, 25, You are digging... (timeout) and digging... (timeout) That's enough sulphur for you
25, 43, 26(L), You prepared a solid poison, OK
27, 21, 28, You got a bucket full of tar
28, 43, 29(L), You prepared a liquid poison, OK
gdy zebrane wszystkie przedmioty (6\*OK), 43, 37, Your fake sheep is full of poison and ready to be eaten by the dragon
37, 43, 30(L), The dragon noticed your gift... (timeout) The dragon ate your sheep and died! - podmiana grafiki na lokacji (martwy smok)!
33, 43 + zabity smok, 34, You cut a piece of dragon's skin
34, 57, 35, You used your tools to make shoes
35, 41, 36, The King is impressed by your shoes
36 -> koniec gry - załadowanie grafiki końcowej (dowolna)

- próba wejścia na lokację za smokiem (warunkowa z zamkiem)
  "You can't go that way... (timeout) The dragon sleeps in a cave! (timeout)"
