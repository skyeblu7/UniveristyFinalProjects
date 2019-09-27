from PIL import Image

filenames = ['ZBlockPieceSized', 'TBlockPieceSized', 'SBlockPieceSized', 'OBlockPieceSized', 'LBlockPieceSized', 'JBlockPieceSized', 'IBlockPieceSized']

for filename in filenames:
    im = Image.open(filename + '.png')
    pix = im.load()

    outFile = open('./txt_files/' + filename + '.txt', 'w')

    for y in range(im.size[1]):
        for x in range(im.size[0]):
            print(pix[x,y])
            r = format(pix[x,y][0], '02x')
            g = format(pix[x,y][1], '02x')
            b = format(pix[x,y][2], '02x')

            outFile.write(r+g+b+'\n')
            im.save(filename + '.png')
    outFile.close()
    
    

