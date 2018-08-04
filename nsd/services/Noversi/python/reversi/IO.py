# IO.py provide Interface to access files. e.g ".node" file.
import numpy as np
import json
import struct
# Load parameters

class RAWReader(object):
    def __init__(self):
        self.SlicedString = []
    # Initialize
    def open(self, Filename):
        try:
            f = open(Filename, 'r')
        except:
            print('Warning: RAWReader readfile "'+Filename+'" not exist.')
        self.SlicedString = (f.read()).split()
        f.close()
    # Translate file to splited list
    def openString(self, String):
        self.SlicedString = String.split()
    # Translate string to splited list
    def pop(self):
        if len(self.SlicedString) > 0:
            return self.SlicedString.pop(0)
        else:
            return None
    # Mock C++ >> operator
# A reader mock C++ style

class RAWWriter(object):
    def __init__(self):
        self.SlicedString = []
    # Initialize
    def write(self, Filename):
        f = open(Filename, 'w')
        for word in self.SlicedString:
            f.write(str(word)+" ")
        f.close()
        self.SlicedString = []
    # Translate file to splited list
    def append(self, Word):
        self.SlicedString.append(Word)
    # Mock C++ << operator
    def newline(self):
        self.SlicedString.append('\n')
    # Add a new line
# A writer mock C++ style

def getAMatrix(MyRAWReader):
    rowsize = int(MyRAWReader.pop())
    colsize = int(MyRAWReader.pop())
    matrix = []
    for row in range(0, rowsize):
        rowlist = []
        for col in range(0, colsize):
            rowlist.append(float(MyRAWReader.pop()))
        matrix.append(rowlist)
    ANSER = np.array(tuple(matrix), dtype=float)
    return ANSER
# Get one cupy matrix by RAWReader

def writeAMatrix(Matrix, MyRAWWriter):
    rowsize = len(Matrix)
    colsize = len(Matrix[0])
    MyRAWWriter.append(rowsize)
    MyRAWWriter.append(colsize)
    MyRAWWriter.newline()
    for row in range(0, rowsize):
        rowlist = Matrix[row]
        for colelement in Matrix[row]:
            MyRAWWriter.append(colelement)
        MyRAWWriter.newline()
# Write one numpy matrix by RAWReader

def getValuefromConfigfile(Filename, ValueTitle):
    try:
        f = open(Filename, 'r')
        config = json.loads(f.read())
        f.close()
        # Load json file to config
        return config[ValueTitle]
    except:
        return None
# Get specify value from file

def setValuetoConfigfile(Filename, ValueTitle, Value):
    config = {}
    try:
        f = open(Filename, 'r')
        config = json.loads(f.read())
        f.close()
    except:
        pass
    # Load json file to config
    f = open(Filename, 'w')
    config[ValueTitle] = Value
    f.write(json.dumps(config, sort_keys=True, indent=4))
    f.close()
# Set specify value from file


def idx2mtrx(FilenameIn, FilenameOut):
    print('processing...')
    rawwriter = RAWWriter()
    idx = read_idx(FilenameIn)
    OUT = np.array((idx[0].flatten(),))
    datalen = len(idx)
    count = 0
    print(str(len(idx))+' data finded')
    print('flatting...')
    print('------------------------------')
    for x in range(1, len(idx)):
        OUT = np.concatenate((OUT,  np.array((idx[x].flatten(),))), axis=0)
        count += 1
        if count >= datalen/30:
            count = 0
            print('*', end='')
    print('')
    print('saving...')
    writeAMatrix(OUT, rawwriter)
    rawwriter.write(FilenameOut+'.mtrx')
    print('saved to'+FilenameOut+'.mtrx')

def printprettyMatrix(Matrix):
    # np.set_printoptions(threshold=np.nan)
    np.set_printoptions(precision=3)
    np.set_printoptions(suppress=True)
    print(Matrix)

def getProfile(MyNeuralNetwork):
    try:
        f = open(p.SAVED_PATH+MyNeuralNetwork.Name+'_profile.json', 'r')
        profile = json.loads(f.read())
        f.close()
        learningalgorithm = profile.pop('LearningAlgorithm')
        profile.update({'LearningAlgorithm':p.LearningAlgorithmDict[learningalgorithm]})
        return profile
    except FileNotFoundError:
        return None
