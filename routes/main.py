from fpdf import FPDF
import os
import sys
import cloudinary
import subprocess
import cloudinary.uploader
import cloudinary.api
import sys
import numpy as np
import json

if __name__ == "__main__":
    main()

def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

## compute main.py
def main():
    lines = read_in()
    np_lines = np.array(lines)
    cloudinary.config( 
    cloud_name = np_lines[4], 
    api_key = np_lines[5], 
    api_secret = np_lines[6] 
    )
    print("In the python File...")
    pdf = FPDF('P','mm','A4')
    # imagelist is the list with all image filenames
    x,y,w,h = 0,0,200,250
    for image in np_lines[1]:
        pdf.add_page()
        pdf.image(image,x,y,w,h)
    title = np_lines[2] + "_" + np_lines[3]
    assignment_file = pdf.output(title +".pdf", "F")

    cloudinary.uploader.upload(assignment_file, public_id = title)
    print(np_lines)  