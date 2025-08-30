import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Client from './Client';
import User from './User';

@Entity()
export default class LogClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.logs)
  client: Client;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  detail?: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
