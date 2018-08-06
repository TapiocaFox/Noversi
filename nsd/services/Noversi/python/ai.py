import sys
from reversi import *
import nodenet.io as nnio

VERSION = 'aphla 2'
AI_path = './Noversi'

neuralnet = nnio.load_neuralnet(AI_path)

key = sys.argv[1]
position = int(sys.argv[2])

response = ''

sess = ReversiSessions()
sess.setBoard(ReversiUtility.convertKeytoBoard(key))
AI = reversi.ReversiNeuralNetAI()
AI.loadValueNetwork(neuralnet)
AI.setPosition(position)
if(sess.cansetBoard(position)):
    aidrop = AI.getaphlabetaDropPoint(sess, 0.01)[0]
    response = 'OK '+str(aidrop[0])+' '+str(aidrop[1])
else:
    response = 'err'

print(response)
sys.stdout.flush()
