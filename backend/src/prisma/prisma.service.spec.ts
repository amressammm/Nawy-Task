import { PrismaService } from './prisma.service';

/**
 * The wrapper exists only so Nest owns the client's lifecycle. If either hook
 * stops firing the failure is quiet — connections leak on shutdown, or the
 * first request pays the connect cost — so both are pinned.
 */
describe('PrismaService', () => {
  it('connects when the module starts', async () => {
    const service = new PrismaService();
    const connect = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();
    expect(connect).toHaveBeenCalled();
  });

  it('disconnects when the module is destroyed', async () => {
    const service = new PrismaService();
    const disconnect = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);

    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
