import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';

@Injectable()
export class CoffeesService {
  // private coffees: Coffee[] = [
  //   {
  //     id: 1,
  //     name: 'Anouar 10',
  //     brand: 'Adidas',
  //     flavors: ['chocolate', 'vanilla'],
  //   },
  // ];

  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    //return this.coffees;
    const { limit, offset } = paginationQuery;
    return this.coffeeModel.find().skip(offset).limit(limit).exec();
  }

  // findOne(id: string) {
  //   const coffee = this.coffees.find((item) => item.id === +id);
  //   if (!coffee) {
  //     //throw new HttpException(`Coffee #${id} not found`, HttpStatus.NOT_FOUND);
  //     throw new NotFoundException(`Coffee #${id} not found`);
  //   }
  //   return coffee;
  // }
  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  // create(createCoffeeDto: any) {
  //   this.coffees.push(createCoffeeDto);
  //   return createCoffeeDto;
  // }
  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);
    return coffee.save();
  }

  // update(id: string, updateCoffDto: any) {
  //   const existingCoffee = this.findOne(id);
  //   if (existingCoffee) {
  //     //update here
  //   }
  // }
  async update(id: string, updateCoffDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffDto }, { new: true })
      .exec();
    if (!existingCoffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return existingCoffee;
  }

  // remove(id: string) {
  //   const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);
  //   if (coffeeIndex >= 0) {
  //     this.coffees.splice(coffeeIndex, 1);
  //   }
  // }
  async remove(id: string) {
    const coffee = await this.findOne(id);
    //return coffee.remove(); //In Mongoose v6+, remove() has been deprecated
    return coffee.deleteOne();
  }

  async recommendCoffee(coffee: Coffee) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });
      await recommendEvent.save({ session });
      await coffee.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}
