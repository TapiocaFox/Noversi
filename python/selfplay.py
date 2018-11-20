import nodenet.io as nnio
import reversi
import pickle
import sys

mainneuralnetname = (input('input main neuralnet name.\n>>>'))
mainAInoise = float(input('input main neuralnet noise.\n>>>'))
mainAI = reversi.ReversiNeuralNetAI()
mainAI.loadValueNetwork(nnio.load_neuralnet(mainneuralnetname))
points = []
mainAIpointsum = 0
othersAIpointsum = 0

neuralnetcount = int(input('input others neuralnet counts.\n>>>'))
AIs = []
neuralnetnames = []
AIsnoise = []
for x in range(neuralnetcount):
    neuralnetnames.append(input('input neuralnet '+str(x+1)+' name.\n>>>'))
    AIsnoise.append(float(input('input noise.\n>>>')))
    AI = reversi.ReversiNeuralNetAI()
    AI.loadValueNetwork(nnio.load_neuralnet(neuralnetnames[-1]))
    AIs.append(AI)
    AIs[-1].setPosition(-1)
    points.append([0, 0])
times = int(input('input play times.\n>>>'))

mainAI.setPosition(1)

sess = reversi.ReversiSessions()
sess.newBoard()
for x in range(times):
    enemyIndex = x%neuralnetcount
    enemyAI = AIs[enemyIndex]
    if int(x/neuralnetcount)%2 == 0:
        sess.setDropPoint(enemyAI.getDropPoint(sess, AIsnoise[enemyIndex]), -1)
    while(sess.cansetBoard(1)>0 or sess.cansetBoard(-1)>0):
        sess.setDropPoint(mainAI.getDropPoint(sess, mainAInoise), 1)
        sess.setDropPoint(enemyAI.getDropPoint(sess, AIsnoise[enemyIndex]), -1)
    sess.newBoard()
    if sess.ReversiRecords[sess.SessionIndexnow-1].Winner == 1:
        points[enemyIndex][0] += 1
        mainAIpointsum += 1
    else:
        points[enemyIndex][1] += 1
        othersAIpointsum += 1
    string = 'session['+str(mainAIpointsum+othersAIpointsum)+'] MainAI(name='+mainneuralnetname+' noise='+str(mainAInoise)+' point='+str([mainAIpointsum, othersAIpointsum])+'), wincount-> '
    string += '(MainAI vs '+neuralnetnames[enemyIndex]+' noise='+str(AIsnoise[enemyIndex])+' point='+str(points[enemyIndex])+')        '
    print(string, end='\r')
    sys.stdout.flush()
print()
reversivaluehandler = reversi.ReversiValueHandler()
for x in range(len(sess.ReversiRecords)-1):
    reversivaluehandler.swallowReversiRecord(sess.ReversiRecords[x])
print('extrating...')
reversivaluehandler.extractBoardCounts()
print('saving...')
file_Name = "value.pickle"
# open the file for writing
fileObject = open(file_Name,'wb')

# this writes the object a to the
# file named 'testfile'
pickle.dump(reversivaluehandler.dumptondarray(),fileObject)

# here we close the fileObject
fileObject.close()
