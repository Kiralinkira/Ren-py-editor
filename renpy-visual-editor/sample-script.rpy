# Sample Ren'Py Script for Testing Import Feature

define e = Character("Eileen", color="#c8ffc8")
define m = Character("Mary", color="#ffc8c8")
define s = Character("Sylvie", color="#c8c8ff")

label start:
    scene bg meadow with fade
    
    "Welcome to the Ren'Py Visual Editor demo!"
    
    show eileen happy at center with dissolve
    
    e "Hi! I'm Eileen, and I'll be your guide today."
    
    e "This editor can import existing Ren'Py scripts and let you edit them visually."
    
    show mary normal at left with moveinleft
    
    m "And I'm Mary! We're here to show you different features."
    
    menu:
        "Tell me about scenes and transitions":
            scene bg room with pixellate
            show eileen happy at right
            e "Scenes set the background, and transitions make them look smooth!"
            
        "Show me character positions":
            show eileen happy at left
            show mary normal at right
            show sylvie smile at center
            s "We can position characters at left, center, or right!"
            
        "I want to see variables":
            $ player_name = "Developer"
            e "Hello, [player_name]! Variables store information."
    
    scene bg sunset with dissolve
    show eileen vhappy at center
    
    e "That's all for this demo!"
    
    e "Try importing this script into the editor to see how it works!"
    
    return