import os

if not os.path.exists('win'):
    os.makedirs('win/')
if not os.path.exists('lose'):
    os.makedirs('lose/')
if not os.path.exists('unknown'):
    os.makedirs('unknown/')
for filename in os.listdir():
    if '.' not in filename:
        try:
            f = open(filename, 'r')
            s = f.read()
            f.close()
            if 'win' in s:
                os.rename(filename, 'win/'+filename)
            elif 'lose' in s:
                os.rename(filename, 'lose/'+filename)
            else:
                os.rename(filename, 'unknown/'+filename)
        except:
            pass
