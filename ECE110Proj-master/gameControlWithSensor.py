import pygame,time,random,cPickle
from Tkinter import *
import serial; #added by Kris 12/10/17  used to get data from an arduino

#Kenneth Koepcke, Parth Triviality
#Final Project
#Dodge the bullets
#Things could potentially do:
##Tkinter menu
##CPickle scores
##idk
#ANYTHING WITH INVINCIBILITY DOES NOT WORK AT ALL
disp_width = 800
disp_height = 600
gameDisplay = pygame.display.set_mode((disp_width,disp_height))
black = (0, 0, 0)
white = (255, 255, 255)
red = (255, 0, 0)
green = (0, 255, 0)
blue = (0, 0, 255)
gold = (250, 215, 0)
foolsgold = (197, 179, 88)
colours = (black, red, green, blue, red, red, red, red, red, red, red)
spec_colours = (foolsgold, gold)
personImg = pygame.image.load("woman.bmp") #woman.jpg for millenium falcon
heartImg = pygame.image.load("heart.jpg")
kittenImg = pygame.image.load("kitten.jpg")








#Added by Kris 12/10/17
arduinoSerialData = serial.Serial('COM3',9600); #used to recieve the data from the arduino and make it useful.
maxDistSens = float(30); #maximum distance expected by the sensor
minDistSens = float(5);  #miminum distence expected by the sensor
slope = float((disp_height)/(maxDistSens-minDistSens)); #the rate of change of the movement of the person in the game with respect to the movement of your hand in front of the sensor
yInt = -minDistSens*slope; #shifts the function downward such that when the sensor detects the minimum distance, the person is displayed at the top of the screen






#rogue functions I don't want to change
def crash(score):
    text = "Time: "
    text += str(score/60) + "s"
    crash_message_display(text)
    pygame.quit()
    quit()
#Dont ask, I can't tell...
def crash_message_display(text):
    display_text = pygame.font.Font("freesansbold.ttf", 50)
    textSurf, textRect = text_object(text, display_text)
    textRect.center = ((disp_width/2),(disp_height/2))
    gameDisplay.blit(textSurf, textRect)
    pygame.display.update()
    time.sleep(3)

def message_display(text, x = disp_width/2, y = disp_height/2):
    display_text = pygame.font.Font("freesansbold.ttf", 50)
    textSurf, textRect = text_object(text, display_text)
    textRect.center = ((x),(y))
    gameDisplay.blit(textSurf, textRect)

        
def text_object(text, font):
    textSurface = font.render(text, True, blue)
    return textSurface, textSurface.get_rect()
#Something I might end up finishing

##class Application(Frame):
##    def __init__(self, master):
##        self.grid()
##        self.create_widgets()
##
##    def create_widgets(self):
##        self.f_label = Label(self, text = "Super Slime Soccer Settings").grid(row = 0, column = 1, sticky = W)
##        self.r_easy_var = StringVar()
##        self.r_ease_var.set("small ")
##        self.r_tshirt_small = Radiobutton(self, text = "Small", variable = self.r_tshirt_var, value = "small ")
##        self.r_tshirt_small.grid(row = 3, column = 1, sticky = W)
##
##        self.r_tshirt_med = Radiobutton(self, text = "Medium", variable = self.r_tshirt_var, value = "medium ")
##        self.r_tshirt_med.grid(row = 3, column = 2, sticky = W)

class Block(object):
    """Block class, creates bullets. Has defaulted aspects"""
    def __init__(self, score, object_startx = -500, object_starty = random.randrange(0, disp_height),colour = red, speed = 5, hard = False, width = 50, height = 10):
        """Takes in Object start x, object star y, object speed"""
        #Could use indexing; could be less lazy
        self.collide = False
        self.hard = False
        self.width = width
        self.height = height
        if self.hard == False:
            self.colour = colour
            self.speed = (speed + (score*0.0001))
            block_magic = random.randrange(0,1000)
            if block_magic == random.randrange(0,1000):
                self.colour = random.choice(spec_colours)
                if self.colour == gold:
                    self.speed = 9 + (score*0.0005)
                if self.colour == foolsgold:
                    self.speed = 8 + (score*0.0005)
            if self.colour == red:
                self.speed = random.randrange(10, 15) + (score*0.0005)
            if self.colour == blue:
                self.speed = 8 + (score*0.0005)
            if self.colour == green:
                self.speed = 3 + (score*0.0005)
            if self.colour == black:
                self.speed = 7 + (score*0.0005)
        else:
            self.colour = red
            self.speed = 9
        self.x = object_startx
        self.y = object_starty
        
    def check_collide(self, y, score, Player):
        """Checks collision based on coords"""
        if (self.x > Player.x + 8 and self.x < Player.x + Player.width) or (self.x + self.width > Player.x + 8 and self.x + self.width < Player.x + Player.width):
            if (self.y > Player.y and self.y < Player.y + Player.height - 10) or (self.y + self.height < Player.y and self.y + self.height > Player.y + Player.height - 10):
                self.damage(Player, score)
                self.collide = True
        if self.x > disp_width:
            self.collide = True

    def move(self):
        """Draws every tic, assumes that bullet will always move"""
        if self.collide == False:
            pygame.draw.rect(gameDisplay, self.colour, [self.x, self.y, self.width, self.height])
            self.x += self.speed
        if self.collide == True:
            self.x = 0

    def damage(self, Player, score):
        if self.colour == green:
            Player.health += 10
            if Player.speed > 5:
                Player.speed -= 0.5
            if Player.speed < 5:
                Player.speed += 0.5
        if Player.invincibility == False:
            if self.colour == red:
                Player.health -= 30
            if self.colour == blue:
                Player.health -= 1
                if Player.speed >= 0.02:
                    Player.speed -= 0.5
            if self.colour == black:
                Player.health -= 10
                Player.speed += 1
            if self.colour == gold:
                #Doesn't work lol
##                Player.invincibility = True
                Player.health += disp_height
            if self.colour == foolsgold:
                Player.speed = -Player.speed
            if Player.health < 0:
                crash(score)


            
                       
        

class Person(object):
    """Player object"""
    def __init__(self,x = disp_width-40,y=0):
        """creates player"""
        self.x = x
        self.y = y
        self.width = 30
        self.height = 54
        self.x_change = 0
        self.y_change = 0
        self.speed = 5
        self.createPerson()
        self.health = 100 
        self.invincibility = False
    def createPerson(self):
        gameDisplay.blit(personImg, (self.x,self.y))
##    def toggleInvincibility(self):
##        #LOTTA LOGIC, NOT MANY RESULTS
##        if self.invincibility == False:
##            self.invicibility = True
##        else:
##            self.invincibility = False
##    def check_invinc(self):
##        if self.invincibility == True:
##            return True
##        else:
##            return False




















    def set_y(self):  #function added by kris 12/10/17
        a = True;
        while(a): #keeps running until data is given from the arduino
            if (arduinoSerialData.inWaiting()>0): #makes sure there is distance data from the arduino before we change the position of the person
                print arduinoSerialData.readline();
                try: #a wierd symbol occurs on the first input, this takes care of that
                    newPos = float(arduinoSerialData.readline()); #takes in distance data from the arduino and assigns it a variable
                except: 
                    a = False; #do nothing when it shows up
                    break;
                if (newPos == .29): #The sensor sometimes flips out and sends .29 for some reason
                    self.y = -60;   #send it somewhere where the person won't lose health
                elif(newPos < minDistSens): # if the new position is closer to the sensor than the minimum expected distace
                    self.y = 0;           #the person is at the top of the screen
                elif(newPos >= minDistSens and newPos <= maxDistSens):#if the data is between the min and max expected distance
                    self.y = int(slope*newPos) + yInt; #The position of the person is set according to a function
                elif(newPos > maxDistSens): #if the position data is farther from the sensor than the max expected distance
                    self.y = disp_height - self.height; #the person is at the bottom of the screen
                a = False;               #ends the while loop
                break;
            break;

                





















            
    def move(self,score):
        self.set_y(); # kris added this 12/10/17 used to set the position according to the position sensor
        gameDisplay.blit(personImg, (self.x,self.y))
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                crash(score)
                pygame.quit()
                quit()

            if event.type == pygame.KEYDOWN:
                #if event.key == pygame.K_UP:
                #    self.y_change = -self.speed + 0.1         Comment made by kris 12/10/17
                #if event.key == pygame.K_DOWN:
                #    self.y_change = self.speed
                if event.key == pygame.K_LEFT:
                    self.x_change = -self.speed*0.75 + 0.1
                if event.key == pygame.K_RIGHT:
                    self.x_change = self.speed*0.75
                if event.key == pygame.K_z and not event.key == pygame.K_RSHIFT:
                    self.health = 9999
                if event.key == pygame.K_x:
                    self.speed = 20
                if event.key == pygame.K_p:
                    score += 1000
                    

            if event.type == pygame.KEYUP:
                if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
                    self.x_change = 0
                #if event.key == pygame.K_UP or event.key == pygame.K_DOWN:     Comment made by kris 12/10/17
                #    self.y_change = 0


        if self.x + self.width > disp_width:
            if self.x_change > 0:
                self.x_change = 0
        if self.x < 0:
            if self.x_change < 0:
                self.x_change = 0

        self.x += self.x_change




        if self.y + self.height > disp_height:
            if self.y_change > 0:
                self.y_change = 0
        if self.y < 0:
            if self.y_change < 0:
                self.y_change = 0
                
        self.y += self.y_change
    #I think some of these I use interchangably...
    def return_y(self):
        return self.y
    def return_x(self):
        return self.x
    def return_health(self):
        return self.health
    def take_damage(self):
        self.health -= 30
    def take_health(self):
        self.health += 5
    def health_bar(self):
        if self.health > disp_height:
            health_color = gold
        else:
            health_color = green
        pygame.draw.rect(gameDisplay, health_color, [disp_width-10,0, 10, self.health/2])


class Game(object):
    def __init__(self, disp_width, disp_height, kittenImg,score = 0):
        #Initialize Window
        difficulty = 2
        hard = False
        pygame.init()
        self.disp_width = disp_width
        self.disp_height = disp_height
        myfont = pygame.font.SysFont("monospace", 16)
        pygame.display.set_caption("Super Slime Soccer")
        #colors
        #Don't understand
        clocl = pygame.time.Clock()
        clock2 = pygame.time.Clock()
        #etc

        score = score
        #wom 30, 54
        #rekt 50, 10
        level = ()
        kris_tup = []
        orgTime = time.time()
        gameExit = False
        while not gameExit:

            gameDisplay.fill(white)
            gameDisplay.blit(kittenImg, (0,0))

            if score < 60:
                Player = Person()
                message_display("Welcome to the program!")
            if score > 60 and score < 200:
                message_display("Now die!")
##            if score > 1200 and score < 1400:
##                message_display("You're not dead yet..?")
##            if score > 1400 and score < 1800:
##                message_display("RNG must really love you! <3 <3")
##            if score > 1800 and score < 3000:
##                gameDisplay.blit(heartImg, (0,0))
##                message_display("I think... I... Love you...")
##            if score > 3000 and score < 4000:
##                message_display("LOL, jk. die. :3")
##                hard = True
##            if score > 4000 and score < 4200:
##                message_display("Cheater")
##            if score > 4200:
##                Player.x = disp_height/2
##                Player.y = disp_width/2

            y = Player.return_y()
            Player.health_bar()
            health = Player.return_health()
            if time.time() - orgTime >= 5:
                Player.invincibility = False
                orgTime == time.time()
##            invinc = Player.check_invinc()
            if Player.invincibility == True:
                print "invincible"
            Player.move(score)
            if score/120 == len(level):
                level += "dango",
                for i in range(len(level)^2):
                    kris_tup.append(Block(score, random.randrange(-1000, 0),random.randrange(0, disp_height), random.choice(colours), 5,hard, random.randrange(50,100), random.randrange(5,20)))
                    
                    
            for dango in kris_tup:
                if dango.x < disp_width:
                    dango.move()
##                    if str(score/60)[-1] in ("1", "2", "3", "4", "5", "6", "7", "8", "9", "0"):
##                        print dango.speed
                    if False == False:
                        dango.check_collide(y, score, Player)
                    else:
                        pass
            message_display(str(score/60) + "s", 80, 30)
            pygame.display.update() #Flip
            clocl.tick(60)
            score += 1

Game = Game(disp_width, disp_height, kittenImg)
Game2 = Game(disp_width, disp_height, kittenImg)
