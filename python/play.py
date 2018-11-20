import nodenet.io as nnio
import reversi
name = input('input ai name.\n>>>')
neuralnet = nnio.load_neuralnet(name)
sess = reversi.ReversiSessions()
sess.newBoard()
AI = reversi.ReversiNeuralNetAI()
AI.loadValueNetwork(neuralnet)
AI.setPosition(-1)
while(sess.cansetBoard(1) == 1 or sess.cansetBoard(-1) == 1):
    reversi.ReversiUtility.printBoard(sess.Boardnow)
    x = -1
    y = -1
    while(sess.cansetDropPoint((x, y), 1)<=0 and sess.cansetBoard(1) == 1):
        print('input x y.')
        x = int(input('x: '))
        y = int(input('y: '))
        if x>7 or y>7 or x<0 or y<0:
            x = -1
            y = -1
    sess.setDropPoint((x, y), 1)
    reversi.ReversiUtility.printBoard(sess.Boardnow)
    aidrop = AI.getaphlabetaDropPoint(sess, 0.01)[0]
    sess.setDropPoint(aidrop, -1)
sess.newBoard()
print(sess.ReversiRecords[0].Winner)
