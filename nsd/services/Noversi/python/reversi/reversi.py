import reversi.IO as io
import numpy as np
import copy
import nodenet as nnet

table = {'A': 'O', 'B': '@', 'N': ' ', 1: 'O', -1: '@', 0: ' '}

class ReversiUtility(object):
    def printKey(Key):
        col = 0
        for location in Key:
            print(table[location]+' ', end='')
            if col == 7:
                print('')
                col = 0
            else:
                col += 1

    def printBoard(Board):
        print('')
        col = 0
        row = 0
        print('  0 1 2 3 4 5 6 7 Y')
        print(' |----------------|\n0|', end = '')
        for location in Board:
            print(table[location]+' ', end='')
            if col == 7:
                if row < 7:
                    print('|\n'+str(row+1)+'|', end = '')
                else:
                    print('|\nX|',end='')
                row += 1
                col = 0
            else:
                col += 1
        print('----------------|')
        print('')

    def printBoardwithDropPoint(Board, DropPoint):
        print('')
        col = 0
        row = 0
        print('  0 1 2 3 4 5 6 7 Y')
        print(' |----------------|\n0|', end = '')
        for location in Board:
            if DropPoint[0] == row and DropPoint[1] == col:
                print('X ', end='')
            else:
                print(table[location]+' ', end='')
            if col == 7:
                if row < 7:
                    print('|\n'+str(row+1)+'|', end = '')
                else:
                    print('|\nX|',end='')
                row += 1
                col = 0
            else:
                col += 1
        print('----------------|')
        print('')

    def getPointbyKey(Key):
        userpoint = 0
        compoint = 0
        for location in Key:
            if location == 'A':
                userpoint += 1
            elif location == 'B':
                compoint += 1
            else:
                pass
        return userpoint, compoint

    def getPointbyBoard(Board):
        userpoint = 0
        compoint = 0
        for location in Board:
            if location == 1:
                userpoint += 1
            elif location == -1:
                compoint += 1
            else:
                pass
        return userpoint, compoint

    def convertKeytoBoard(Key):
        board = []
        for location in Key:
            if location == 'A':
                board.append(1)
            elif location == 'B':
                board.append(-1)
            else:
                board.append(0)
        return board

    def convertBoardtoKey(Board):
        key = ''
        for location in Board:
            if location == 1:
                key += 'A'
            elif location == -1:
                key += 'B'
            else:
                key += 'N'
        return key

    def reverseBoard(Board):
        newboard = []
        for x in Board:
            newboard.append(x*-1)
        return newboard

    def rotateBoard90degree(Board):
        newboard = []
        for col in range(8):
            for row in range(8):
                newboard.append(Board[(7-row)*8+col])
        return newboard

    def mirrorBoardXaxis(Board):
        newboard = []
        for row in range(8):
            for col in range(8):
                newboard.append(Board[(7-row)*8+col])
        return newboard

    def mirrorBoardYaxis(Board):
        newboard = []
        for row in range(8):
            for col in range(8):
                newboard.append(Board[row*8+(7-col)])
        return newboard

    def rotateDropPoint90degree(DropPoint):
        newdrop = ()
        newdrop += (DropPoint[1],)
        newdrop += ((7-DropPoint[0]),)
        return newdrop

    def mirrorDropPointXaxis(DropPoint):
        newdrop = ()
        newdrop += (7-DropPoint[0],)
        newdrop += (DropPoint[1],)
        return newdrop

    def mirrorDropPointYaxis(DropPoint):
        newdrop = ()
        newdrop += (DropPoint[0],)
        newdrop += (7-DropPoint[1],)
        return newdrop

    def modifyDropPoints(Function, DropPointList):
        newlist = []
        for droppoint in DropPointList:
            newlist.append(Function(droppoint))
        return newlist

class ReversiNeuralNetAI(object):
    def __init__(self):
        self.MyPosition = 0
        self.ValueNetwork = None
        self.PolicyNetwork = None

    def loadValueNetwork(self, NeuralNet):
        self.ValueNetwork = NeuralNet

    def loadPolicyNetwork(self, NeuralNet):
        self.PolicyNetwork = NeuralNet

    def setPosition(self, Position):
        self.MyPosition = Position

    def getDropPoint(self, MyReversiSessions, Noise=0):
        boardnowdelta = MyReversiSessions.Boardnow
        valuenetworkresults = []
        policynetworkresults = []
        droppoint = (-1, -1)
        biggestvalue = -1
        for x in range(8):
            for y in range(8):
                reversisessionsdelta = ReversiSessions()
                reversisessionsdelta.setBoard(boardnowdelta)
                if reversisessionsdelta.cansetDropPoint((x, y), self.MyPosition) > 0:
                    reversisessionsdelta.setDropPoint((x, y), self.MyPosition)
                    board = np.array(reversisessionsdelta.Boardnow).reshape(8, 8)
                    if self.MyPosition == -1:
                        board = board*-1
                    finalvalue = 0
                    if self.ValueNetwork is not None:
                        finalvalue += self.ValueNetwork.forward(np.array([[board.tolist()]]))[0, 0]
                    finalvalue += np.random.uniform(-Noise, Noise)

                    valuenetworkresult = [(x, y), finalvalue]
                    valuenetworkresults.append(valuenetworkresult)
        for x in valuenetworkresults:
            if x[1] > biggestvalue:
                biggestvalue = x[1]
                droppoint = x[0]
        return droppoint

    def getDropPointDebug(self, MyReversiSessions, Noise=0):
        boardnowdelta = MyReversiSessions.Boardnow
        debug_info = []
        valuenetworkresults = []
        policynetworkresults = []
        droppoint = (-1, -1)
        biggestvalue = -1
        for x in range(8):
            for y in range(8):
                reversisessionsdelta = ReversiSessions()
                reversisessionsdelta.setBoard(boardnowdelta)
                if reversisessionsdelta.cansetDropPoint((x, y), self.MyPosition) > 0:
                    reversisessionsdelta.setDropPoint((x, y), self.MyPosition)
                    board = np.array(reversisessionsdelta.Boardnow).reshape(8, 8)
                    if self.MyPosition == -1:
                        board = board*-1
                    finalvalue = 0
                    if self.ValueNetwork is not None:
                        finalvalue += float(self.ValueNetwork.forward(np.array([[board.tolist()]]))[0, 0])
                    finalvalue += float(np.random.uniform(-Noise, Noise))
                    valuenetworkresult = [(x, y), finalvalue]
                    debug_info.append({"DropPoint": [x, y], "Value": finalvalue, "Policy:": 0, "Sum": finalvalue+0})
                    valuenetworkresults.append(valuenetworkresult)
        for x in valuenetworkresults:
            if x[1] > biggestvalue:
                biggestvalue = x[1]
                droppoint = x[0]
        return droppoint, debug_info

    def getaphlabetaDropPoint(self, MyReversiSessions, Depth=0, Noise=0):
        boardnowdelta = MyReversiSessions.Boardnow
        debug_info = []
        valuenetworkresults = []
        policynetworkresults = []
        droppoint = (-1, -1)
        biggestvalue = -1
        for x in range(8):
            for y in range(8):
                reversisessionsdelta = ReversiSessions()
                reversisessionsdelta.setBoard(boardnowdelta)
                if reversisessionsdelta.cansetDropPoint((x, y), self.MyPosition) > 0:
                    reversisessionsdelta.setDropPoint((x, y), self.MyPosition)
                    AI2 = copy.deepcopy(self)
                    AI2.setPosition(self.MyPosition*-1)
                    reversisessionsdelta.setDropPoint(AI2.getDropPoint(reversisessionsdelta), self.MyPosition*-1)
                    reversisessionsdelta.setDropPoint(self.getDropPoint(reversisessionsdelta), self.MyPosition)
                    board = np.array(reversisessionsdelta.Boardnow).reshape(8, 8)
                    if self.MyPosition == -1:
                        board = board*-1
                    finalvalue = 0
                    if self.ValueNetwork is not None:
                        finalvalue += float(self.ValueNetwork.forward(np.array([[board.tolist()]]))[0, 0])
                    finalvalue += float(np.random.uniform(-Noise, Noise))
                    debug_info.append({"DropPoint": [x, y], "Value": finalvalue, "Policy:": 0, "Sum": finalvalue+0})
                    valuenetworkresult = [(x, y), finalvalue]
                    valuenetworkresults.append(valuenetworkresult)

        for x in valuenetworkresults:
            if x[1] > biggestvalue:
                biggestvalue = x[1]
                droppoint = x[0]

        return droppoint, debug_info

class ReversiSessions(object):
    def __str__(self):
        pass

    def __init__(self):
        self.Boardnow = None
        self.ReversiRecords = []
        self.SessionIndexnow = -1

    def cansetBoard(self, Position):
        canset = 0
        for x in range(8):
            for y in range(8):
                if self.cansetDropPoint((x, y), Position) > 0:
                    canset = 1
        return canset

    def cansetDropPoint(self, DropPoint, Position):
        if self.Boardnow[(DropPoint[0])*8+DropPoint[1]] != 0:
            return -1
        pointsum = 0
        boarddelta = self.Boardnow
        point = self.DropPointHandler(DropPoint, Position, (1, 0), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (0, 1), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (1, 1), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, 0), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (0, -1), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, -1), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (1, -1), 0)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, 1), 0)
        if point > 0:
            pointsum += point
        if pointsum > 0:
            pointsum += 1

        if pointsum > 0:
            return pointsum
        else:
            return -1

    def newBoard(self):
        if self.SessionIndexnow == -1:
            self.SessionIndexnow = 0
            self.Boardnow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            self.ReversiRecords.append(ReversiRecord())
        else:
            Points = ReversiUtility.getPointbyBoard(self.Boardnow)
            if Points[0] > Points[1]:
                self.ReversiRecords[self.SessionIndexnow].Winner = 1
            else:
                self.ReversiRecords[self.SessionIndexnow].Winner = -1
            self.SessionIndexnow += 1
            self.Boardnow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            self.ReversiRecords.append(ReversiRecord())

    def setBoard(self, Board):
        if self.SessionIndexnow == -1:
            self.SessionIndexnow = 0
            self.Boardnow = copy.deepcopy(Board)
            self.ReversiRecords.append(ReversiRecord())
        else:
            Points = ReversiUtility.getPointbyBoard(self.Boardnow)
            if Points[0] > Points[1]:
                ReversiRecords[self.SessionIndexnow].Winner = 1
            else:
                ReversiRecords[self.SessionIndexnow].Winner = -1
            self.SessionIndexnow += 1
            self.Boardnow = copy.deepcopy(Board)
            self.ReversiRecords.append(ReversiRecord())

    def setDropPoint(self, DropPoint, Position):
        if self.Boardnow[(DropPoint[0])*8+DropPoint[1]] != 0:
            return -1
        pointsum = 0
        boarddelta = copy.deepcopy(self.Boardnow)
        point = self.DropPointHandler(DropPoint, Position, (1, 0), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (0, 1), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (1, 1), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, 0), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (0, -1), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, -1), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (1, -1), 1)
        if point > 0:
            pointsum += point
        point = self.DropPointHandler(DropPoint, Position, (-1, 1), 1)
        if point > 0:
            pointsum += point
        if pointsum > 0:
            pointsum += 1
        if pointsum > 0:
            self.Boardnow[DropPoint[0]*8+DropPoint[1]] = Position
            ReversiRecordnow = self.ReversiRecords[self.SessionIndexnow]
            ReversiRecordnow.BoardList.append(boarddelta)
            ReversiRecordnow.TurnList.append(Position)
            ReversiRecordnow.DropPointList.append(DropPoint)
            return pointsum
        else:
            return -1

    def DropPointHandler(self, StartPoint, Position, Vector, doReverse):
        nextpoint = (StartPoint[0]+Vector[0], StartPoint[1]+Vector[1])
        if StartPoint[0] < 0 or StartPoint[0] > 7 or StartPoint[1] < 0 or StartPoint[1] > 7:
            return -1
        if nextpoint[0] < 0 or nextpoint[0] > 7 or nextpoint[1] < 0 or nextpoint[1] > 7:
            return -1
        Board2D = []
        for x in range(8):
            row = []
            for y in range(8):
                row.append(self.Boardnow[x*8+y])
            Board2D.append(row)
        if (Board2D[StartPoint[0]+Vector[0]])[StartPoint[1]+Vector[1]] == Position and (Board2D[StartPoint[0]])[StartPoint[1]] == -Position:
            return 0
        elif (Board2D[StartPoint[0]+Vector[0]])[StartPoint[1]+Vector[1]] == -Position:
            nextStartPoint = (StartPoint[0]+Vector[0], StartPoint[1]+Vector[1])
            handlerresult = self.DropPointHandler(nextStartPoint, Position, Vector, doReverse)
            if handlerresult>=0:
                if doReverse == 1:
                    self.Boardnow[(StartPoint[0]+Vector[0])*8+StartPoint[1]+Vector[1]] = Position
                return handlerresult+1
            else:
                return -1
        else:
            return -1

    def printRecordbyIndex(self, Index):
        self.ReversiRecords[self.SessionIndexnow].printRecord()

class ReversiRecord(object):

    def __init__(self):
        self.BoardList = []
        self.TurnList = []
        self.DropPointList = []
        self.Winner = 0

    def printRecord(self):
        for x in range(len(self.BoardList)):
            print('It\'s '+table[self.TurnList[x]]+'\'s turn. In this board. It drop '+str(self.DropPointList[x]))
            ReversiUtility.printBoardwithDropPoint(self.BoardList[x], self.DropPointList[x])
        print('Winer is '+table[self.Winner])

    def loadfromFile(self, Filename):
        self.BoardList = []
        self.TurnList = []
        self.DropPointList = []
        self.Winner = 0
        f = open(Filename, 'r')
        rawstring = f.read()
        f.close()
        for location in rawstring.split():
            if ('A' in location) or ('B' in location) or ('N' in location):
                self.BoardList.append(ReversiUtility.convertKeytoBoard(location))
        for location in range(len(rawstring.split())):
            if ('user' in rawstring.split()[location]) :
                self.TurnList.append(1)
                self.DropPointList.append((int(rawstring.split()[location+1]), int(rawstring.split()[location+2])))
            elif  ('com' in rawstring.split()[location]):
                self.TurnList.append(-1)
                self.DropPointList.append((int(rawstring.split()[location+1]), int(rawstring.split()[location+2])))
        if 'win' in rawstring:
            self.Winner = -1
        elif 'lose' in rawstring:
            self.Winner = 1
        else:
            self.Winner = 0

class ReversiBoardsContainer(object):

    def __init__(self):
        self.Boards = []
        self.Contains = []

    def __str__(self):
        string = ''
        for x in range(len(self.Boards)):
            string += str(self.Boards[x])+' '+str(self.Contains[x])+'\n'
        return string

    def getIndex(self, Board):
        return self.getIndex_handler(Board, 0, len(self.Boards)-1)

    def getIndex_handler(self, Board, Start, End):
        if len(self.Boards)==0:
            return None
        middle = int((Start+End)/2)
        order = self.compare(Board, self.Boards[middle])
        if order == 0:
            return middle
        elif order == -1:
            if Start-End == 0:
                return None
            return self.getIndex_handler(Board, Start, middle)
        else:
            if Start-End == 0:
                return None
            return self.getIndex_handler(Board, middle+1, End)

    def getInsertIndex(self, Board):
        return self.getInsertIndex_handler(Board, 0, len(self.Boards)-1)

    def getInsertIndex_handler(self, Board, Start, End):
        if(len(self.Boards)==0):
            return 0
        middle = int((Start+End)/2)
        order = self.compare(Board, self.Boards[middle])
        if order == 0:
            return None
        elif order == -1:
            if Start-End == 0:
                return middle
            return self.getInsertIndex_handler(Board, Start, middle)
        else:
            if Start-End == 0:
                return middle+1
            return self.getInsertIndex_handler(Board, middle+1, End)

    def compare(self, Board1, Board2):
        for x in range(len(Board1)):
            if Board1[x] > Board2[x]:
                return 1
            elif Board1[x] < Board2[x]:
                return -1
        return 0

    def setContainbyBoard(self, Board, Contain):
        if self.getIndex(Board) == None:
            Index = self.getInsertIndex(Board)
            self.Boards.insert(Index, Board)
            self.Contains.insert(Index, [])
        self.Contains[self.getIndex(Board)] = Contain

    def getBoardbyIndex(self, Index):
        return self.Boards[Index]

    def getContainbyBoard(self, Board):
        return self.Contains[self.getIndex(Board)]

    def getContainbyIndex(self, Index):
        return self.Contains[Index]

    def getContainslist(self):
        return self.Contains

    def getBoardslist(self):
        return self.Boards

    def setContainbyIndex(self, Index, Contain):
        self.Contains[Index] = Contain

class ReversiValueHandler(object):
    # Transfer all perspective to 1
    def __init__(self):
        self.Boards2Counts = ReversiBoardsContainer()

    def extractBoardCounts(self):
        boards2countsdelta = copy.deepcopy(self.Boards2Counts)
        boardsdelta = boards2countsdelta.getBoardslist()
        countsdelta = boards2countsdelta.getContainslist()
        lengthdelta = len(boardsdelta)
        print('data count initial')
        print(lengthdelta)
        for x in range(lengthdelta):
            # print(len(self.Boards2Counts.getBoardslist()))
            boardcountcache = countsdelta[x]
            boardcache = ReversiUtility.rotateBoard90degree(boardsdelta[x])
            self.addBoardCount(boardcache, boardcountcache)
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addBoardCount(boardcache, boardcountcache)
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addBoardCount(boardcache, boardcountcache)
        print('data count after rotate')
        print(len(self.Boards2Counts.getBoardslist()))
        # Rotate
        for x in range(lengthdelta):
            # print(len(self.Boards2Counts.getBoardslist()))
            boardcountcache = countsdelta[x]
            boardcache = ReversiUtility.mirrorBoardXaxis(boardsdelta[x])
            self.addBoardCount(boardcache, boardcountcache)
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addBoardCount(boardcache, boardcountcache)
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addBoardCount(boardcache, boardcountcache)
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addBoardCount(boardcache, boardcountcache)
        print('data count after mirror+rotate')
        print(len(self.Boards2Counts.getBoardslist()))
        # Mirror X + Rotate

    def addBoardCount(self, Board, BoardCount):
        if self.Boards2Counts.getIndex(Board) == None:
            self.Boards2Counts.setContainbyBoard(Board, [0, 0])
        Boards2CountsIndex = self.Boards2Counts.getIndex(Board)
        oldcount = self.Boards2Counts.getContainbyIndex(Boards2CountsIndex)
        newcount = [oldcount[0]+BoardCount[0], oldcount[1]+BoardCount[1]]
        self.Boards2Counts.setContainbyIndex(Boards2CountsIndex, newcount)

    def swallowReversiRecord(self, MyReversiRecord):
        winner = MyReversiRecord.Winner
        for x in range(len(MyReversiRecord.TurnList)-1):
            thisturn = MyReversiRecord.TurnList[x]
            thisboard = MyReversiRecord.BoardList[x+1]
            if thisturn == -1:
                thisboard = ReversiUtility.reverseBoard(thisboard)
            # print(str(winner)+' '+str(thisturn)+' '+str(thisboard))
            if thisturn == winner:
                self.addBoardCount(thisboard, [1, 0])
            else:
                self.addBoardCount(thisboard, [0, 1])

    def dumptondarray(self):
        bias = 0.9
        amplifyfactor = 1
        inputdata = []
        outputdata = []
        for x in range(len(self.Boards2Counts.getBoardslist())):
            Board = np.array(self.Boards2Counts.getBoardbyIndex(x))
            inputdata.append([Board.reshape(8, 8).tolist()])
            count = self.Boards2Counts.getContainbyIndex(x)
            wincount = count[0]
            losecount = count[1]
            value = wincount/(wincount+losecount)
            if wincount+losecount == 1 and wincount == 1:
                value = bias
            elif wincount+losecount == 1 and losecount == 1:
                value = 1-bias
            outputdata.append([amplifyfactor*value, amplifyfactor*(1-value)])
        InputData = np.array(tuple(inputdata))
        OutputData = np.array(tuple(outputdata))
        return [InputData, OutputData]

class ReversiPolicyHandler(object):
    # Transfer all perspective to 1
    def __init__(self):
        self.Board2Drops = ReversiBoardsContainer()

    def extractDropPoints(self):
        board2dropsdelta = copy.deepcopy(self.Board2Drops)
        boardsdelta = board2dropsdelta.getBoardslist()
        droppointslistdelta = board2dropsdelta.getContainslist()
        lengthdelta = len(boardsdelta)
        print('data count initial')
        print(lengthdelta)
        for x in range(lengthdelta):
            # print(len(self.Boards2Counts.getBoardslist()))
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, (droppointslistdelta[x])[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, (droppointslistdelta[x])[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardsdelta[x])
            self.addDropPoints(boardcache, droppointscache)
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addDropPoints(boardcache, droppointscache)
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addDropPoints(boardcache, droppointscache)
        print('data count after rotate')
        print(len(self.Board2Drops.getBoardslist()))
        # Rotate
        for x in range(lengthdelta):
            # print(len(self.Boards2Counts.getBoardslist()))
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.mirrorDropPointXaxis, (droppointslistdelta[x])[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.mirrorDropPointXaxis, (droppointslistdelta[x])[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.mirrorBoardXaxis(boardsdelta[x])
            self.addDropPoints(boardcache, droppointscache)
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addDropPoints(boardcache, droppointscache)
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addDropPoints(boardcache, droppointscache)
            windroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[0])
            losedroppointscache = ReversiUtility.modifyDropPoints(ReversiUtility.rotateDropPoint90degree, droppointscache[1])
            droppointscache = [windroppointscache, losedroppointscache]
            boardcache = ReversiUtility.rotateBoard90degree(boardcache)
            self.addDropPoints(boardcache, droppointscache)
        print('data count after mirror+rotate')
        print(len(self.Board2Drops.getBoardslist()))
        # Mirror X + Rotate

    def addDropPoints(self, Board, DropPoints):
        if self.Board2Drops.getIndex(Board) == None:
            self.Board2Drops.setContainbyBoard(Board, [[], []])
        Board2DropsIndex = self.Board2Drops.getIndex(Board)
        olddroppoints = self.Board2Drops.getContainbyIndex(Board2DropsIndex)
        newcount = [olddroppoints[0]+DropPoints[0], olddroppoints[1]+DropPoints[1]]
        self.Board2Drops.setContainbyIndex(Board2DropsIndex, newcount)

    def swallowReversiRecord(self, MyReversiRecord):
        winner = MyReversiRecord.Winner
        for x in range(len(MyReversiRecord.TurnList)-1):
            thisturn = MyReversiRecord.TurnList[x]
            thisboard = MyReversiRecord.BoardList[x]
            thisdroppoint = MyReversiRecord.DropPointList[x]
            if thisturn == -1:
                thisboard = ReversiUtility.reverseBoard(thisboard)
            # print(str(winner)+' '+str(thisturn)+' '+str(thisboard))
            if thisturn == winner:
                self.addDropPoints(thisboard, [[], [thisdroppoint]])
            else:
                self.addDropPoints(thisboard, [[thisdroppoint], []])

    def dumptomtrx(self):
        amplifyfactor = 5
        tilefactor = 0
        inputdata = []
        outputdata = []
        for x in range(len(self.Board2Drops.getBoardslist())):
            inputdata.append(self.Board2Drops.getBoardbyIndex(x))
            droppoints = self.Board2Drops.getContainbyIndex(x)
            windroppoints = droppoints[0]
            losedroppoints = droppoints[1]
            winboard = np.zeros(64)
            loseboard = np.zeros(64)
            for droppoint in windroppoints:
                winboard[droppoint[0]*8+droppoint[1]] += 1
            for droppoint in losedroppoints:
                loseboard[droppoint[0]*8+droppoint[1]] += 1
            finalboard = (winboard-loseboard/(winboard+loseboard))*amplifyfactor
            where_are_NaNs = np.isnan(finalboard)
            (finalboard)[where_are_NaNs] = tilefactor
            outputdata.append(finalboard.tolist())

        InputData = io.RAWWriter()
        io.writeAMatrix(np.array(tuple(inputdata)), InputData)
        InputData.write('in_policy.mtrx')
        OutputData = io.RAWWriter()
        io.writeAMatrix(np.array(tuple(outputdata)), OutputData)
        OutputData.write('out_policy.mtrx')
