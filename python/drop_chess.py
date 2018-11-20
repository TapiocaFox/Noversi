import sys
from reversi import *
import nodenet.io as nnio

VERSION = 'aphla 2'
AI_path = './reversicore/reversi'

key = sys.argv[1]
position = int(sys.argv[2])
row = int(sys.argv[3])
col =  int(sys.argv[4])

response = ''

sess = ReversiSessions()
sess.setBoard(ReversiUtility.convertKeytoBoard(key))

if sess.cansetDropPoint((row, col), position) > 0:
    sess.setDropPoint((row, col), position)
    newkey = ReversiUtility.convertBoardtoKey(sess.Boardnow)
    point = ReversiUtility.getPointbyBoard(sess.Boardnow)
    turn = position*-1
    if sess.cansetBoard(position*-1) > 0:
        turn = position*-1
    elif  sess.cansetBoard(position) > 0:
        turn = position
    else:
        turn = 0
    response = 'OK '+str(newkey)+' '+str(point[0])+' '+str(point[1])+' '+str(turn)
else:
    response = 'err'

print(response)
sys.stdout.flush()
