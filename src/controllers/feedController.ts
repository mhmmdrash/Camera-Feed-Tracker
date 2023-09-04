import { Request, Response } from 'express';
import User from '../models/user';
import Feed from '../models/user';
import UserFeedAccess from '../models/userFeedAccess';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { logOperation } from '../utils/log';

const hasAccessOrNot = async (feedId: number, userId: number, del: boolean) => {
    try{
        const userFeedAccess = await UserFeedAccess.findOne({
            where: {
                feedId: feedId,
                userId: userId,
            }
        });
    
        if (!userFeedAccess) {
            return false;
        }
    
        if (del && !userFeedAccess.canDelete) {
            return false;
        }
    
        return true;
    } catch(err: any) {
        throw err;
    }
}

export const getUserRole = async (userId: number) => {
    try {
        const user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            return false
        }

        return user.role;

    }
    catch(err: any) {
        return err;
    }
}

export const createFeed = async (req: AuthenticatedRequest, res: Response) => {
  const feedDetails = req.body;
  const feedUrl = feedDetails.url;

  if (req.user?.role != 'super-admin') {
    return res.status(500).json({
        message: "Not Authorised to create feed"
      });
  }

  try {
    logOperation(`Creating a feed with url: ${feedUrl}`);

    const feed = await Feed.findOne({
      where: {
        url: feedUrl,
      }
    });

    if (feed) {
      return res.status(500).json({
        message: "Feed already exists"
      });
    } 

    await Feed.create(feedDetails);

    logOperation(`Feed with url: ${feedUrl} created successfully`);
    return res.status(201).json({
        message: "Feed created successfully",
    });

  } catch(err: any) {
    logOperation(`Feed creation failed: ${err.message}`);
    return res.status(500).json({
      message: "User creation failed " + err as string
    });
  }
}

export const readFeed = async (req: Request, res: Response) => {
  const feedDetails = req.body;
  const feedUrl = feedDetails.url;
  try {
    logOperation(`Reading a feed with url: ${feedUrl}`);
    const feed = await Feed.findOne({
      where: {
        url: feedUrl,
      }
    });

    if (!feed) {
      return res.status(500).json({
        message: "Feed does not exist"
      });
    } 

    logOperation(`Feed with url: ${feedUrl} read successfully`);
    return res.status(201).json({
      message: JSON.stringify(feed),
    });
  } catch(err: any) {
    logOperation(`Feed reading failed: ${err.message}`);
    return res.status(404).json({
      message: "Feed creation failed " + err as string
    });
  }
}

export const updateFeed = async (req: AuthenticatedRequest, res: Response) => {
  const feedDetails = req.body;
  const feedUrl = feedDetails.url;

    if (req.user?.role != 'super-admin') {
        const access = await hasAccessOrNot(
        feedDetails.id,
        feedDetails.userId,
        false
        );
    
        if (!access) {
        return res.status(500).json({
            message: "Do not have access to update this feed"
            });
        }
  }

  try {
    logOperation(`Updating a feed with url: ${feedUrl}`);
    const feed = await Feed.findOne({
      where: {
        url: feedUrl,
      }
    });

    if (!feed) {
      return res.status(500).json({
        message: "Feed does not exist"
      });
    } 

    feed.set(feedDetails);
    await feed.save();
    
    logOperation(`Feed with url: ${feedUrl} updated successfully`);
    return res.status(201).json({
      message: `Feed ${feedDetails.name} updated created successfully`,
    });
  } catch(err: any) {
    logOperation(`Feed updation failed: ${err.message}`);
    return res.status(404).json({
      message: "Feed creation failed " + err as string
    });
  }
}

export const deleteFeed = async (req: AuthenticatedRequest, res: Response) => {
    const feedDetails = req.body;
    const feedUrl = feedDetails.url;

    if (req.user?.role != 'super-admin') {
        const access = await hasAccessOrNot(
          feedDetails.id,
          feedDetails.userId,
          true 
        );
      
        if (!access) {
          return res.status(500).json({
              message: "Do not have access to delete this feed"
          });
         }    
    }

    try {
        logOperation(`Deleting a feed with url: ${feedUrl}`);
        const feed = await Feed.findOne({
            where: {
            url: feedUrl,
            }
        });
    
        if (!feed) {
            return res.status(500).json({
            message: "Feed does not exist"
            });
        }  

        await feed.destroy();

        logOperation(`Feed with url: ${feedUrl} deleted successfully`);
        return res.status(500).json({
            mesage: `Deleted the Feed ${feed.name}`
        });

    } catch(err: any) {
        logOperation(`Feed deletion failed: ${err.message}`);
        return res.status(404).json({
        message: "Feed deletion failed " + err as string
        });
    } 
}

export const giveAccessToFeed = async (req: AuthenticatedRequest, res: Response) => {
    const accessDetails = req.body;
    const userId = accessDetails.userId;

    const role: string = await getUserRole(userId);
    const callerRole: string = await getUserRole(req.user?.id);

    if (role) {
        return res.status(500).json({
            message: "User does not exist"
        });
    }

    if (role == 'admin' && callerRole != 'super-admin' || role == 'basic' && callerRole == 'basic') {
        return res.status(500).json({
          message: "Not Authorised to give access to feed"
        });
      }

    if (role == 'basic' && callerRole == 'admin') {
       const access = await hasAccessOrNot(
            accessDetails.feedId,
            req.user?.id,
            false
       );

       if (!access) {
            return res.status(500).json({
                message: "Not authorised to give access to this feed"
            });
       }
    }
    
    try {
        logOperation(`Giving feed access to user ${userId} of feed with id: ${accessDetails.feedId}`);
        const user = await User.findOne({
            where: {
                id: userId,
            }
        });
    
        if (!user) {
            return res.status(500).json({
                message: "User does not exist"
            });
        }
    
        await UserFeedAccess.create({
            userId: user.id,
            feedId: accessDetails.feedId,
            canDelete: accessDetails.canDelete,
        })  

        logOperation(`Feed with id: ${accessDetails.feedId} given access to user ${userId} successfully`);
        return res.status(200).json({
            message: `Given access of feed ${accessDetails.feedId} to user ${userId}`,
        })
    } catch (err: any) {
        logOperation(`Feed access grant failed: ${err.message}`);
        return res.status(500).json({
            message: err as string
        });
    }
}

