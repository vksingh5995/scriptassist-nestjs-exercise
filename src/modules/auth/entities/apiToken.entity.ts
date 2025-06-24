import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api_tokens')
export class ApiToken {
  @PrimaryGeneratedColumn('uuid')
  tokenId: string;

  @Column({
    type: 'int',
  })
  userId: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
