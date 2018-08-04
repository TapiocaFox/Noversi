from reversi import *
filename = input('Input your UUID.\n>>>')
myreversirecord = ReversiRecord()
myreversirecord.loadfromFile(filename)
myreversirecord.printRecord()
