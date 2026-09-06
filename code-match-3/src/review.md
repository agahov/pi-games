1.
I see that event-bus clean commands on pause.
I Suggest  two types of commands. Control command which will work even in pause 
Sometimes we need to change camera resolution, change params and so on. 

Gameplay command which will be stopped receiving on pause.
Please don't clean the queue. Just block  new gameplay commands. Simply check them by type.  



2.
gfx.rect(pos.x - vis.size / 2, pos.y - vis.size / 2, vis.size, vis.size);
      gfx.fill({ color: vis.color, alpha: 1 });
       // Position the container in stage coordinates.
      gfx.x = 0;
      gfx.y = 0;

 I suggest to move gfx to pos and draw from zero.     


3. I need logging system, make logger with  several domains (UI, Pixi, )  logger = createLogger(["ui", "seclection"]), logger.debug("click on tile"), with global filter for domain. turn of/on
I want to see logs for
 - init stage, init main  modules.
 - communication of base elements.
 - start rendering.
 - send event
 - send command


4. I don't see any visula elements on screen after pnpm run dev 
and we don't have any code in main.ts

I suggest to make 1-7 Acceptance tests. For testing a major success scenario.(pipe for functions)
Describe very clearly for human (me). 
Fist:
- After app start I have to see tiles on the screen. 


