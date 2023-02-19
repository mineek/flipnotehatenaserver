from re import X
from Hatenatools import UGO
import os
pages = []

flipnotes = os.listdir("flipnotes")

pagecount = (len(flipnotes)-1)/50 + 1
flipcount = len(flipnotes)

def makepage(flipnotes, page, next, count):
    ugo = UGO()
    ugo.Loaded = True
    ugo.Items = []
    ugo.Items.append(("layout", (2, 1)))
    ugo.Items.append(("topscreen text", ["Hatena", "Flipnotes",str(count), "", "Made by Mineek"], 0))
    ugo.Items.append(("category", "http://flipnote.hatena.com/ds/v2-xx/frontpage/hotmovies.uls", "Flipnotes", True))
    ugo.Items.append(("unknown", ("3", "http://flipnote.hatena.com/ds/v2-xx/help/post_howto.htm", "UABvAHMAdAAgAEYAbABpAHAAbgBvAHQAZQA=")))
    if page > 1:
        ugo.Items.append(("button", 115, "Previous", "http://flipnote.hatena.com/ds/v2-xx/frontpage/hotmovies.uls?page=%i" % (page-1), ("", ""), None))
    # for every .ppm file in the directory flipnotes
    for file in flipnotes:
       if file.endswith(".ppm"):
           f = open("./flipnotes/" + file, "rb")
           ugo.Items.append(("button", 3, "", "http://flipnote.hatena.com/ds/v2-xx/movie/%s/%s" % ("meow", file), ("69", "765", "573", "0"), ("bleh", f.read(0x6a0))))
           f.close()
    if next:
        ugo.Items.append(("button", 115, "Next", "http://flipnote.hatena.com/ds/v2-xx/frontpage/hotmovies.uls?page=%i" % (page+1), ("", ""), None))
    return ugo.Pack()

for i in xrange(pagecount):
    pages.append(makepage(flipnotes[i*50:i*50+50], i+1, i<pagecount-1, flipcount))
for page in pages:
    # save the page
    f = open("hatena/pages/page%i.ugo" % (pages.index(page)+1), "wb")
    f.write(page)
    f.close()